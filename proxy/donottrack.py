"""
donottrack.py
Jonathan Mayer - jmayer@stanford.edu

A proof-of-concept web proxy that adds a Do Not Track header to all requests.  Not intended for regular use.

v0.02 - 1/30/11
Updated header.

v0.01 - 10/5/10
Sloppy HTTP 1.0 support.  Apologies for any Python faux pas; this is my first foray into the language.
Acknowledgement: Architecture follows Suzuki Hisao's TinyHTTPProxy, http://www.okisoft.co.jp/esc/python/proxy/.
"""

import BaseHTTPServer
import SocketServer
import urlparse
import socket
import select

DoNotTrackHeaderName = "DNT"
DoNotTrackHeaderValue = "1"

AllowedHosts = ["127.0.0.1"]

MAX_RECV = 8192

class DNTProxyRequestHandler(BaseHTTPServer.BaseHTTPRequestHandler):

	def do_GET(self):
		# Parse out URI
		(scheme, netloc, path, params, query, fragment) = urlparse.urlparse(self.path)
		s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		try:
			if self._connectSocket(s, netloc):
				
				# Form HTTP request
				relativePath = urlparse.urlunparse(("", "", path, params, query, ""))
				request = "{0} {1} {2}\r\n".format(self.command, relativePath, self.request_version)
				self.headers["Connection"] = "close"
				self.headers[DoNotTrackHeaderName] = DoNotTrackHeaderValue
				del self.headers["Proxy-Connection"]
				for header, value in self.headers.items():
					request += "{0}: {1}\r\n".format(header, value)
				request += "\r\n"
				
				#print "Request to " + netloc + "...\n" + request
				
				s.send(request)
				
				self._proxyResponse(s)
		except KeyboardInterrupt:
			raise
		finally:
			s.close()
			self.connection.close()
			#print "Connections closed!"

	def do_CONNECT(self): pass
	
	#Connect a socket to a remote host
	def _connectSocket(self, s, netloc):
		#Find the port
		port = 80
		portIndex = netloc.find(":")
		host = netloc
		if portIndex > 0:
			port = int(netloc[portIndex+1:])
			host = netloc[:portIndex]
		hostPortTuple = host, port
		try: s.connect(hostPortTuple)
		except socket.error:
			return 0
		except KeyboardInterrupt:
			raise
		return 1
	
	do_HEAD = do_GET
	do_POST = do_GET
	do_PUT = do_GET
	do_DELETE = do_GET
	
	def _proxyResponse(self, s):
		while 1:
			data = s.recv(MAX_RECV)
			if data:
				self.connection.send(data)
			else:
				break

class ThreadedHTTPServer(SocketServer.ThreadingMixIn, BaseHTTPServer.HTTPServer): pass

if __name__ == "__main__":
	from sys import argv
	try:
		if len(argv) is 2:
			port = int(argv[1])
			address = ('', port)
			httpd = ThreadedHTTPServer(address, DNTProxyRequestHandler)
			httpd.serve_forever()
		else:
			print "Usage: python donottrack <port>"
	except:
		raise SystemExit