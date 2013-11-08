window.themingStore.routers.PushRouter = function () {
  var socketId = null;
  if (! window.io) return;
  var socket   = io.connect(window.themingStore.nodeServer);
  
  /**
   * emits an action to the node socket passing the data 
   */
  this.callToAction = function (action, data)
  {
    socket.emit('phpdo', {action: action, data: data});
  }
  
  // when the socket sends a message type id, the internal id arrives, we should send the user id
  // as response
  socket.on('id', function (data) {
    socketId = data;
    socket.emit('id', window.themingStore.currentUser.get('id'));
  });
  
  socket.on('notification', function(data) {
    console.log(data);
    switch(data.module)
    {
      case 4: // emails
        // regardless of the event compose the data to update the charts
        break;
    }
  });
  
};