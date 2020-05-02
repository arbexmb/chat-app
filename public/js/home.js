const socket = io()

const $indexForm = document.querySelector('#index-form')

const $indexFormInput = $indexForm.querySelector('#room-selector')
const suggestions = $indexForm.querySelector('#suggestions')

$indexFormInput.addEventListener('keyup', () => {
  if($indexFormInput.value.length > 2) {
    socket.emit('roomInputKeyUp')
  } else {
    suggestions.innerHTML = ''
  }
})

socket.on('roomsList', (list) => {
  const teste = autoComplete($indexFormInput.value, list)
  console.log(teste)
})

function autoComplete(value, rooms) {
  const valueToLower = value.trim().toLowerCase()
  const valueLength = valueToLower.length
  const filteredRooms = rooms.filter((room) => room.toLowerCase().includes(valueToLower))
  filteredRooms.map((val) => {
    const html = '<option value="'+val+'">'
    if(suggestions.innerHTML.indexOf(html) === -1) {
      suggestions.insertAdjacentHTML('beforeend', html)
    }
  })
}
