const AWS = require('aws-sdk');

AWS.config.update({
	region: "us-east-2",
	endpoint: "http://localhost:8000"
});

async function test2 (event, context) {

	const DocumentClient = new AWS.DynamoDB.DocumentClient();

	// Consigo el token
	const tokenHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.25d73ffca742.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
	const tokenDecoded = tokenHeader.split(' ');
	const tokenBody = tokenDecoded[1];


	// Me fijo en la base de datos de token-email-lookup
	const {Items: getUser} = await DocumentClient.query({
		TableName: 'token-email-lookup',
		KeyConditionExpression: '#token = :token',
		ExpressionAttributeNames: {
			'#token': 'token'
		},
		ExpressionAttributeValues: {
			':token': tokenBody
		}
	}).promise();

	// Consigo el email
	const emailVerify = getUser[0].email;
	

	// Busco las notas de ese email
	const {Items: notas} = await DocumentClient.query({
		TableName: 'user-notes',
		KeyConditionExpression: '#user = :user',
		ExpressionAttributeNames: {
			'#user': 'user'
		},
		ExpressionAttributeValues: {
			':user': emailVerify
		},
		Limit: 10
	}).promise();


	// Ordena las notas de la mas vieja a la mas nueva
	const notasSorted = notas.sort(function(a, b) {
		var dateA = new Date(a.create_date).getTime();
    	var dateB = new Date(b.create_date).getTime();
    	return dateA > dateB ? 1 : -1; 
	});

	// Devuelvo las notas
	return {
		statusCode: 200,
		body: JSON.stringify({
			message: 'Prueba del testing 2',
			notasSorted
		}),
	};

};

module.exports = { test2 }
