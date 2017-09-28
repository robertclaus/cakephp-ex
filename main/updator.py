import time
import MySQLdb as mdb
import sys
import math
import time


def foo():
	dt=.1
#	print "Test"
	try:
		con=mdb.connect('localhost','root','holger','test')
		with con:
			cur=con.cursor()
			cur.execute("DELETE FROM Ships WHERE hp<=0")
			cur.execute("SELECT *,TIMEDIFF(NOW(),detonateAt)>0 FROM Ships")
			result=cur.fetchall()
			for row in result:
				vx=row[6]+row[1]*dt*math.cos(math.radians(row[2]))
				vy=row[7]+row[1]*dt*math.sin(math.radians(row[2]))
				vx=vx-vx*dt;
				vy=vy-vy*dt;
#				if row[2]>90&row[2]<270
#					vx=-1*vx

				x=row[3]+vx*dt
				y=row[4]+vy*dt
				if(math.sqrt(x*x+y*y)>2150):
					direction=math.atan2(y,x)
					x=2145*math.cos(direction)
					y=2145*math.sin(direction)

				if row[-1]==1:
					cur.execute("DELETE FROM Ships WHERE id="+str(row[0]))
					cur.execute("SELECT * FROM Ships WHERE SQRT(POW(x-"+str(row[3])+",2)+POW(y-"+str(row[4])+",2))<"+str(row[14]))
					targets=cur.fetchall()
					for tar in targets:
						cur.execute("UPDATE test.Ships SET hp="+str(tar[13]-1)+" WHERE id="+str(tar[0]))
				else:
					cur.execute("UPDATE test.Ships SET x="+str(x)+",y="+str(y)+",vx="+str(vx)+",vy="+str(vy)+",lastUpdate=Now() WHERE Ships.id="+str(row[0]))
#		print "MySQL version: %s" % \
#			result
#			result.fetch_row()[0]
	except mdb.Error, e:
		print "Error: "+str(e)
		sys.exit(1)
	finally:
		if con:
			con.close()	

testcounter=50000000
foo()
print "done with one"
while testcounter>0:
	lastTime=int(round(time.time()*1000))
	testcounter=testcounter-1
	foo()
	while(int(round(time.time()*1000))-100<lastTime):
		1+1
