#!/bin/bash
rm -f db/test.sqlite
sqlite3 db/test.sqlite < db/migrate.sql
