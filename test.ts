import express from "express";
import { Request, Response, CookieOptions } from "express";

const app  = express()

app.get("/", (req: Request, res: Response, next: Function): void => {
    res.cookie()
})
