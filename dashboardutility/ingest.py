import csv 
from influxdb import InfluxDBClient
import sys
import geohash

''' JSON Body Example

json_body = [
    {
        "measurement": "cpu_load_short",
        "tags": {
            "host": "server01",
            "region": "us-west"
        },
        "time": "2009-11-10T23:00:00Z",
        "fields": {
            "value": 0.64
        }
    }
]

'''

def getVal(type,val):
    if type == "int":
        return int(val)
    elif type == "float":
        return float(val)
    else:
        return val

client = InfluxDBClient('localhost', 8086, 'root', 'root', 'example')
client.drop_database('example')
client.create_database('example')

json_body = []
with open(sys.argv[1]) as f:
    reader = csv.reader(f,delimiter='|')
    for row in reader:
        time = ""
        lat = float(0)
        lon = float(0)
        vals = []
        for val in row:
            v = val.split(',')
            if v[0] == "datetime":
                time = v[2]
            elif v[0] == "latitude":
                lat = float(v[2])
            elif v[0] == "longitude":
                lon = float(v[2])
            else:
                vals.append(v)

        for value in vals:
            obj = {}
            obj["time"] = time
            obj["measurement"] = value[0]
            obj["fields"] = {"value":getVal(value[1],value[2]),"title":value[0],"lat":lat,"lon":lon, "geohash": geohash.encode(lat,lon)}
            json_body.append(obj)
        
        if len(json_body) > 10000:
            client.write_points(json_body)
            json_body = []

if len(json_body) > 0:
    client.write_points(json_body)
