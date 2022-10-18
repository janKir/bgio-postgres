# Changelog

## [1.0.15] - 2022-10-19

- fix failing tests caused by type changes
- fix security issues

## [1.0.14] - 2022-10-19

- add tests and CI
- fix security issues
- update README

## [1.0.13] - 2020-12-23

- restructure dist files for simpler imports
- lower boardgame.io peer dependency to >=0.40.0

## [1.0.12] - 2020-12-21

- fix package.json main entry

## [1.0.11] - 2020-12-21

- re-export sequelize package

## [1.0.10] - 2020-12-20

- use latest boardgame.io and sequelize versions
- consistent naming: "game" -> "match"
- provide public getter for sequelize instance

## [1.0.9] - 2020-11-24

- fix support for boardgame.io >=0.40

## [1.0.8] - 2020-09-27

- allow extra options when using URI

## [1.0.7] - 2020-08-10

-  Make players an empty array rather than null or undefined

## [1.0.6] - 2020-07-18

- fix setMetadata error when createdAt / updatedAt args are not specified

## [1.0.5] - 2020-07-17

- provide ability to filter match list (feature coming with boardgame.io 0.40.x)

## [1.0.4] - 2020-07-17

- fix error when `fetch` finds no match

## [1.0.3] - 2020-06-05

- allow usage with URI argument or options object