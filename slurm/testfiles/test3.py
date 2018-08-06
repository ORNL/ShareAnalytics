import csv
import sys
from random import randint

# Python script to test that slurm cluster is functioning properly
# Writes data from csv file to output file
# Assigns random score to score.txt file

file = open("foo.txt",'w')

with open(sys.argv[1],'r') as testfile:
    reader = csv.reader(testfile,delimiter=',')
    for line in reader:
        file.write(','.join(line))

file.close()

file = open("score.txt",'w')
file.write(str(randint(50, 100)))
file.close()
