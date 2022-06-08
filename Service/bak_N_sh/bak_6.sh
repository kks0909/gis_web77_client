#!/bin/bash
#version 7.7.6.0
#делаем бекап БД в сб
PGPASSWORD="gfhjkmubc" pg_dump -h IPАДРЕС_СЕРВЕРА_БД -p 5432 -U postgres -n pods -n web50 -n flow_chart -n gis_integration50 -n sutstpa -F c -b -f /home/websys53/pg_res_dump/GIS_dump_6.tar.gz GIS
