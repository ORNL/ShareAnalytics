import csv
import sys
import random
import datetime

class GenData:

    # name, type, startrange, endrange
    values = [
        ['wind-speed','int',12,18],
        ['temperature','int',65,75],
        ['humidity','int',90,100]
    ]

    startdate = datetime.datetime.utcnow()
    datecounter = 0

    latlngvals = [
        [35,-82],
        [36,-84],
        [36.2,-87]
    ]

    latlngstate = False
    latlngindex = 0

    def __init__(self):
        pass

    def getVal(self,type,start,end):
        if type == "int":
            return str(random.randint(start,end))
        elif type == "float":
            return str(random.uniform(start,stop))

    def writeToFile(self):
        f = open(sys.argv[1], 'w')

        for i in range(0,int(sys.argv[2])):
            date = self.startdate - datetime.timedelta(0,self.datecounter)
            for x in range(0,len(self.latlngvals)):
                towrite = ""
                label = "loc" + str(x)
                for val in self.values:
                    towrite += val[0] + label + "," + val[1] + "," + self.getVal(val[1],val[2],val[3]) + "|"
                towrite += "datetime,date," + date.strftime("%Y-%m-%d %H:%M:%S") + "|"
                towrite += "latitude,lat," + str(self.latlngvals[x][0]) + "|"
                towrite += "longitude,long," + str(self.latlngvals[x][1])
                f.write(towrite + "\n")
            self.datecounter += 1
            for i in range(0,len(self.latlngvals)):
                self.latlngvals[i][1] -= .01

gendat = GenData()
gendat.writeToFile()