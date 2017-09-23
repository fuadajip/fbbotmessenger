const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

const token = "EAAMHYU4szGEBAAVX8RHJ4tV0o77FBziT0bp13rzXykhLPohsgheH3d7nLmc6ZBoh7savEtfQJ0kcVsqQG6qjlEKSzkknVgRyFfMxmiX5IYUaSfMZAOD76MeKmQ37tUbvBbnufgmWauEsO2q0Jb1AIcxZBGEZA5RgiLNcj2879zttZB543uAnx"
const crypto = require('crypto')
const AppSecret = 'hello_world';

app.set('port', (process.env.PORT || 5000))
app.use(bodyParser.json({verify: verifyRequestSignature}))
app.use(bodyParser.urlencoded({extended: false}))

app.use(bodyParser.json())

app.get('/', function (req, res) {
	res.send('Masterclass Facebook Jakarta - Example Webhook')
})

app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'make_indonesian_great_again') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

// app.post('/webhook/', function (req, res) {
//     let messaging_events = req.body.entry[0].messaging
//     for (let i = 0; i < messaging_events.length; i++) {
// 	    let event = req.body.entry[0].messaging[i]
// 	    let sender = event.sender.id
// 	    if (event.message && event.message.text) {
// 		    let text = event.message.text
// 		    sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
// 	    }
//     }
//     res.sendStatus(200)
// })

app.post('/webhook/', function (req, res) {
	let data = req.body
	if(data.object == 'page'){
	  data.entry.forEach(function(pageEntry) {
		pageEntry.messaging.forEach(function(messagingEvent) {
		  if(messagingEvent.message.text){
			sendTextMessage(messagingEvent.sender.id,messagingEvent.message.text);
		  } else {
			sendTextMessage(messagingEvent.sender.id,'Service Belum Support Untuk Mendeteksi Hal ini');
		  }
		}); 
	  });
	  res.sendStatus(200)
	}
  })

// function sendTextMessage(sender, text) {
//     let messageData = { text:text }
//     request({
// 	    url: 'https://graph.facebook.com/v2.6/me/messages',
// 	    qs: {access_token:token},
// 	    method: 'POST',
// 		json: {
// 		    recipient: {id:sender},
// 			message: messageData,
// 		}
// 	}, function(error, response, body) {
// 		if (error) {
// 		    console.log('Error sending messages: ', error)
// 		} else if (response.body.error) {
// 		    console.log('Error: ', response.body.error)
// 	    }
//     })
// }

function sendTextMessage(sender, text) {
	let url = `https://graph.facebook.com/v2.6/${sender}?fields=first_name,last_name,profile_pic&access_token=${token}`;
	
	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		let parseData = JSON.parse(body);
		let messageData = {
		  text: `Hi ${parseData.first_name} ${parseData.last_name}, you send message : ${text}`
		}
		request({
		  url: 'https://graph.facebook.com/v2.10/me/messages',
		  qs: {
			access_token: token
		  },
		  method: 'POST',
		  json: {
			recipient: {
			  id: sender
			},
			message: messageData,
		  }
		}, function (error, response, body) {
		  if (error) {
			console.log('Error sending messages: ', error)
		  } else if (response.body.error) {
			console.log('Error: ', response.body.error)
		  }
		})
	  }
	})
  }

  
function verifyRequestSignature(req, res, buf){
  let signature = req.headers["x-hub-signature"];
  
  if(!signature){
    console.error('You dont have signature')
  } else {
    let element = signature.split('=')
    let method = element[0]
    let signatureHash = element[1]
    let expectedHash = crypto.createHmac('sha1', AppSecret).update(buf).digest('hex')

    console.log('signatureHash = ', signatureHash)
    console.log('expectedHash = ', expectedHash)
    if(signatureHash != expectedHash){
      console.error('signature invalid, send message to email or save as log')
    }
  }
}
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
