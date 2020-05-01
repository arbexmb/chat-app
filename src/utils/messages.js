const time = () => { 
  return new Date().getTime()
}

const generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: time
  }
}

const generateLocationMessage = (username, url) => {
  return {
    username,
    url,
    createdAt: time
  }
}

module.exports = {
  generateMessage,
  generateLocationMessage
}
