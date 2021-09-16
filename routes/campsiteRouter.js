const express = require("express");
const Campsite = require("../models/campsite");
const authenticate = require("../authenticate");
var createError = require("http-errors");
const campsiteRouter = express.Router();
const cors = require("./cors");

campsiteRouter
    .route("/")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Campsite.find()
            .populate("comments.author")
            .then((campsites) => {
                res.status(200).json(campsites);
            })
            .catch((err) => next(err));
    })
    .post(
        cors.corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res, next) => {
            Campsite.create(req.body)
                .then((campsite) => {
                    console.log("Campsite Created ", campsite);
                    res.status(200).json(campsite);
                })
                .catch((err) => next(err));
        }
    )
    .put(
        cors.corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res) => {
            res.status(403).end("PUT operation not supported on /campsites");
        }
    )
    .delete(
        cors.corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res, next) => {
            Campsite.deleteMany()
                .then((response) => {
                    res.status(200).json(response);
                })
                .catch((err) => next(err));
        }
    );

campsiteRouter
    .route("/:campsiteId")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .populate("comments.author")
            .then((campsite) => {
                res.status(200).json(campsite);
            })
            .catch((err) => next(err));
    })
    .post(
        cors.corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res) => {
            res.status(403).end(
                `POST operation not supported on /campsites/${req.params.campsiteId}`
            );
        }
    )
    .put(
        cors.corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res, next) => {
            Campsite.findByIdAndUpdate(
                req.params.campsiteId,
                {
                    $set: req.body,
                },
                { new: true }
            )
                .then((campsite) => {
                    res.status(200).json(campsite);
                })
                .catch((err) => next(err));
        }
    )
    .delete(
        cors.corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res, next) => {
            Campsite.findByIdAndDelete(req.params.campsiteId)
                .then((response) => {
                    res.status(200).json(response);
                })
                .catch((err) => next(err));
        }
    );

campsiteRouter
    .route("/:campsiteId/comments")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .populate("comments.author")
            .then((campsite) => {
                if (campsite) {
                    res.status(200).json(campsite.comments);
                } else {
                    return next(
                        createError(
                            404,
                            `Campsite ${req.params.campsiteId} not found`
                        )
                    );
                }
            })
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then((campsite) => {
                if (campsite) {
                    req.body.author = req.user._id;
                    campsite.comments.push(req.body);
                    campsite
                        .save()
                        .then((campsite) => {
                            res.status(200).json(campsite);
                        })
                        .catch((err) => next(err));
                } else {
                    return next(
                        createError(
                            404,
                            `Campsite ${req.params.campsiteId} not found`
                        )
                    );
                }
            })
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.status(403).end(
            `PUT operation not supported on /campsites/${req.params.campsiteId}/comments`
        );
    })
    .delete(
        cors.corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res, next) => {
            Campsite.findById(req.params.campsiteId)
                .then((campsite) => {
                    if (campsite) {
                        for (
                            let i = campsite.comments.length - 1;
                            i >= 0;
                            i--
                        ) {
                            campsite.comments
                                .id(campsite.comments[i]._id)
                                .remove();
                        }
                        campsite
                            .save()
                            .then((campsite) => {
                                res.status(200).json(campsite);
                            })
                            .catch((err) => next(err));
                    } else {
                        return next(
                            createError(
                                404,
                                `Campsite ${req.params.campsiteId} not found`
                            )
                        );
                    }
                })
                .catch((err) => next(err));
        }
    );

campsiteRouter
    .route("/:campsiteId/comments/:commentId")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .populate("comments.author")
            .then((campsite) => {
                if (campsite && campsite.comments.id(req.params.commentId)) {
                    res.status(200).json(
                        campsite.comments.id(req.params.commentId)
                    );
                } else if (!campsite) {
                    return next(
                        createError(
                            404,
                            `Campsite ${req.params.campsiteId} not found`
                        )
                    );
                } else {
                    return next(
                        createError(
                            404,
                            `Comment ${req.params.commentId} not found`
                        )
                    );
                }
            })
            .catch((err) => next(err));
    })
    .post(
        cors.corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res) => {
            res.status(403).end(
                `POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`
            );
        }
    )
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then((campsite) => {
                if (campsite && campsite.comments.id(req.params.commentId)) {
                    const authorId = campsite.comments.id(req.params.commentId)
                        .author._id;
                    // check if comment's author
                    if (authorId.equals(req.user._id)) {
                        if (req.body.rating) {
                            campsite.comments.id(req.params.commentId).rating =
                                req.body.rating;
                        }
                        if (req.body.text) {
                            campsite.comments.id(req.params.commentId).text =
                                req.body.text;
                        }
                        campsite
                            .save()
                            .then((campsite) => {
                                res.status(200).json(campsite);
                            })
                            .catch((err) => next(err));
                    } else {
                        return next(
                            createError(
                                403,
                                "You are not allowed to update this comment."
                            )
                        );
                    }
                } else if (!campsite) {
                    return next(
                        createError(
                            404,
                            `Campsite ${req.params.campsiteId} not found`
                        )
                    );
                } else {
                    return next(
                        createError(
                            404,
                            `Comment ${req.params.commentId} not found`
                        )
                    );
                }
            })
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then((campsite) => {
                if (campsite && campsite.comments.id(req.params.commentId)) {
                    const authorId = campsite.comments.id(req.params.commentId)
                        .author._id;
                    // check if comment's author
                    if (authorId.equals(req.user._id)) {
                        campsite.comments.id(req.params.commentId).remove();
                        campsite
                            .save()
                            .then((campsite) => {
                                res.status(200).json(campsite);
                            })
                            .catch((err) => next(err));
                    } else {
                        return next(
                            createError(
                                403,
                                "You are not allowed to delete this comment."
                            )
                        );
                    }
                } else if (!campsite) {
                    return next(
                        createError(
                            404,
                            `Campsite ${req.params.campsiteId} not found`
                        )
                    );
                } else {
                    return next(
                        createError(
                            404,
                            `Comment ${req.params.commentId} not found`
                        )
                    );
                }
            })
            .catch((err) => next(err));
    });

module.exports = campsiteRouter;
