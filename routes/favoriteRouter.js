const express = require("express");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const favoriteRouter = express.Router();
const cors = require("./cors");
var createError = require("http-errors");
const mongoose = require("mongoose");

favoriteRouter
    .route("/")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate("user")
            .populate("campsites")
            .then((favorites) => {
                res.status(200).json(favorites);
            })
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                // if user has favorite document
                // update that favorite document
                if (favorite) {
                    [...req.body].map((campsite) => {
                        // check if the campsite is already in the array
                        if (!favorite.campsites.includes(campsite._id)) {
                            favorite.campsites.push(campsite._id);
                        }
                    });

                    favorite
                        .save()
                        .then((response) => {
                            res.status(200).json(response);
                        })
                        .catch((err) => next(err));
                }
                // if user has no favorite document
                // create one and add the campsite IDs
                else {
                    const newFavorite = new Favorite({
                        user: req.user._id,
                        campsites: [...req.body].map(
                            (campsite) => campsite._id
                        ),
                    });

                    newFavorite
                        .save()
                        .then((response) => {
                            res.status(200).json(response);
                        })
                        .catch((err) => next(err));
                }
            })
            .catch((err) => {
                // campsite validation
                if (err instanceof mongoose.CastError)
                    return next(createError(400, "Invalid campsite"));

                return next(err);
            });
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.status(403).end("PUT operation not supported on /favorites");
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then((response) => {
                if (response) res.status(200).json(response);
                else
                    return next(
                        createError(
                            404,
                            "You do not have any favorites to delete."
                        )
                    );
            })
            .catch((err) => next(err));
    });

favoriteRouter
    .route("/:campsiteId")
    .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) =>
        res.sendStatus(200)
    )
    .get(cors.cors, (req, res) => {
        res.status(403).end(
            `GET operation not supported on /favorites/${req.params.campsiteId}`
        );
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                // if user has favorite document
                // update that favorite document
                if (favorite) {
                    // check if the campsite is already in the array
                    if (!favorite.campsites.includes(req.params.campsiteId)) {
                        favorite.campsites.push(req.params.campsiteId);
                    } else {
                        return next(
                            createError(
                                400,
                                "That campsite is already in the list of favorites!"
                            )
                        );
                    }

                    favorite
                        .save()
                        .then((response) => {
                            res.status(200).json(response);
                        })
                        .catch((err) => next(err));
                }
                // if user has no favorite document
                // create one and add the campsite IDs
                else {
                    const newFavorite = new Favorite({
                        user: req.user._id,
                        campsites: req.params.campsiteId,
                    });

                    newFavorite
                        .save()
                        .then((response) => {
                            res.status(200).json(response);
                        })
                        .catch((err) => next(err));
                }
            })
            .catch((err) => {
                // campsite validation
                if (err instanceof mongoose.CastError)
                    return next(createError(400, "Invalid campsite"));

                return next(err);
            });
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.status(403).end(
            `PUT operation not supported on /favorites/${req.params.campsiteId}`
        );
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                // if user has favorite document
                if (favorite) {
                    // check if the campsite is already in the array
                    if (favorite.campsites.includes(req.params.campsiteId)) {
                        // remove campsite from favorites
                        favorite.campsites.splice(
                            favorite.campsites.indexOf(req.params.campsiteId),
                            1
                        );

                        // then update favorites
                        favorite
                            .save()
                            .then((response) => {
                                res.status(200).json(response);
                            })
                            .catch((err) => next(err));
                    } else {
                        return next(
                            createError(
                                400,
                                "The campsite does not exist in favorites"
                            )
                        );
                    }
                } else {
                    return next(
                        createError(400, "There are no favorites to delete")
                    );
                }
            })
            .catch((err) => next(err));
    });

module.exports = favoriteRouter;
