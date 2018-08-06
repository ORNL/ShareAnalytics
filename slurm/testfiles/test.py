import csv
import sys 

file = open("foo.txt",'w')

with open(sys.argv[1],'r') as testfile:
    reader = csv.reader(testfile,delimiter=',')
    for line in reader:
        file.write(','.join(line))

file.close()

file = open("score.txt",'w')
file.write('93')
file.close()