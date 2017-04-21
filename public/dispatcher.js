(() => {
  const socket = io('http://localhost:3000')
  const container = document.getElementById('container')

  function showMessage (txt) {
    const div = document.createElement('div')
    div.classList.add('message')
    div.classList.add('from')
    div.innerText = txt

    container.childElementCount
      ? container.insertBefore(div, container.firstElementChild)
      : container.appendChild(div)
  }

  socket
    .on('dispatch', (msg) => {
      showMessage(`Hämta ${msg.data.name} på ${msg.data.location} klockan ${moment(msg.time).format('HH:mm:ss')} (${moment(msg.time).locale('sv').fromNow()})`)
    })
})()
