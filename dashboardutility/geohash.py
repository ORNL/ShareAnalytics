'''
Copyright (c) 2015 Mapzen

MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
'''

BASE32MAPR = dict((count,k) for count,k in enumerate(BASESEQUENCE))

def _float_to_bits(value, lower=-90.0, middle=0.0, upper=90.0, length=15):
  """Convert a float to a list of GeoHash bits."""
  ret = []
  for i in range(length):
    if value >= middle:
      lower = middle
      ret.append(1)
    else:
      upper = middle
      ret.append(0)
    middle = (upper + lower) / 2
  return ret

def _bits_to_geohash(value):
  """Convert a list of GeoHash bits to a GeoHash."""
  ret = []
  # Get 5 bits at a time
  for i in (value[i:i+5] for i in xrange(0, len(value), 5)):
    # Convert binary to integer
    # Note: reverse here, the slice above doesn't work quite right in reverse.
    total = sum([(bit*2**count) for count,bit in enumerate(i[::-1])])
    ret.append(BASE32MAPR[total])
  # Join the string and return
  return "".join(ret)

def encode(lonlat, length=12):
  """Encode a (lon,lat) pair to a GeoHash."""
  assert len(lonlat) == 2, "Invalid lon/lat: %s"%lonlat
  # Half the length for each component.
  length /= 2
  lon = _float_to_bits(lonlat[0], lower=-180.0, upper=180.0, length=length*5)
  lat = _float_to_bits(lonlat[1], lower=-90.0, upper=90.0, length=length*5)
  # Zip the GeoHash bits.
  ret = []
  for a,b in zip(lon,lat):
    ret.append(a)
    ret.append(b)
  return _bits_to_geohash(ret)