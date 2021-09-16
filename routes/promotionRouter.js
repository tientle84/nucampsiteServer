const express = require("express");
const Promotion = require("../models/promotion");
const authenticate = require("../authenticate");
const promotionRouter = express.Router();
const cors = require("./cors");

promotionRouter
    .route("/")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Promotion.find()
            .then((promotions) => {
                res.status(200).json(promotions);
            })
            .catch((err) => next(err));
    })
    .post(
        cors.corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res, next) => {
            Promotion.create(req.body)
                .then((promotion) => {
                    console.log("Promotion Created ", promotion);
                    res.status(200).json(promotion);
                })
                .catch((err) => next(err));
        }
    )
    .put(
        cors.corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res) => {
            res.status(403).end("PUT operation not supported on /promotions");
        }
    )
    .delete(
        cors.corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res, next) => {
            Promotion.deleteMany()
                .then((response) => {
                    res.status(200).json(response);
                })
                .catch((err) => next(err));
        }
    );

promotionRouter
    .route("/:promotionId")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Promotion.findById(req.params.promotionId)
            .then((promotion) => {
                res.status(200).json(promotion);
            })
            .catch((err) => next(err));
    })
    .post(
        cors.corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res) => {
            res.status(403).end(
                `POST operation not supported on /promotions/${req.params.promotionId}`
            );
        }
    )
    .put(
        cors.corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res, next) => {
            Promotion.findByIdAndUpdate(
                req.params.promotionId,
                {
                    $set: req.body,
                },
                { new: true }
            )
                .then((promotion) => {
                    res.status(200).json(promotion);
                })
                .catch((err) => next(err));
        }
    )
    .delete(
        cors.corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res, next) => {
            Promotion.findByIdAndDelete(req.params.promotionId)
                .then((response) => {
                    res.status(200).json(response);
                })
                .catch((err) => next(err));
        }
    );

module.exports = promotionRouter;
