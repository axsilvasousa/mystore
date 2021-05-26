import './util/module-alias';
import express,{NextFunction, Request,Response} from "express"
import http from "http"
import helmet from "helmet";
import { Server } from '@overnightjs/core';
import { Application } from 'express';
import cors from "cors";
import * as database from '@src/database';
import logger from './logger';

import routes from "@src/http/routes"

export class SetupServer extends Server {

  /*
   * same as this.port = port, declaring as private here will
   * add the port variable to the SetupServer instance
   */
  constructor(private port = 3000) {
    super();
  }

  /*
   * We use a different method to init instead of using the constructor
   * this way we allow the server to be used in tests and normal initialization
   */
  public async init(): Promise<void> {
    this.setupExpress();
    await this.databaseSetup();
    //this.setupErrorHandlers();

  }

  private setupExpress(): void {
    this.app.use(helmet())
    this.app.use(cors({ origin: "*" }))
    this.app.set("trust proxy", true)
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: false }))
    this.app.use(routes)
  }

  public getApp(): Application {
    return this.app;
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  public async close(): Promise<void> {
    await database.close();
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info('Server listening on port: ' + this.port);
    });
  }
}