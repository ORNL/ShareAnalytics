import csv 
from influxdb import InfluxDBClient
import sys
import time
import datetime
import geohash

def getVal(type,val):
    if type == "int":
        return int(val)
    elif type == "float":
        return float(val)
    else:
        return val

client = InfluxDBClient('localhost', 8086, 'root', 'root', 'example')

json_body = []
thetime = ""
with open(sys.argv[1]) as f:
    reader = csv.reader(f,delimiter='|')
    for row in reader:
        lat = float(0)
        lon = float(0)
        vals = []
        for val in row:
            v = val.split(',')
            if v[0] == "datetime":
                if thetime != "" and thetime != v[2]:
                    client.write_points(json_body)
                    json_body = []
                    time.sleep(1)
                thetime = v[2]
            elif v[0] == "latitude":
                lat = float(v[2])
            elif v[0] == "longitude":
                lon = float(v[2])
            else:
                vals.append(v)

        for value in vals:
            obj = {}
            obj["time"] = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
            obj["measurement"] = value[0]
            obj["fields"] = {"value":getVal(value[1],value[2]),"title":value[0],"lat":lat,"lon":lon, "geohash": geohash.encode(lat,lon)}
            json_body.append(obj)
