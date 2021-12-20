
exports.run =  async (event, context) => {
  
  console.log('event 👉', event);

  return {
    body: JSON.stringify({message: 'Successful lambda is within docker'}),
    statusCode: 200,
  };
}
