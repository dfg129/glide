
export const handler =  async (event, context) => {
	console.log(event);

	return {
	   "statusCode": 201,
	   "body": JSON.stringify({
		   message: "Hey there"
	   })
	};
}
