/*
var time = new Date().getMilliseconds();
var msgType = RemoteSupport.Test.messageType.Text;
var bodyData = [5,6,7,8,9];
var body = RemoteSupport.Test.Message.createBodyVector(builder, bodyData);

RemoteSupport.Test.Message.startMessage(builder);
RemoteSupport.Test.Message.addMessageType(builder, msgType);
RemoteSupport.Test.Message.addTimeStamp(builder, time);
RemoteSupport.Test.Message.addBody(builder, body);
var msg = RemoteSupport.Test.Message.endMessage(builder);
builder.finish(msg);
var buffed = builder.asUint8Array();

//var msg = RemoteSupport.Test.Message.createMessage(builder, msgType, time, body);

console.log(typeof buffed);
console.log(buffed);


var bytes = buffed;
var buf = new flatbuffers.ByteBuffer(bytes);
// Get an accessor to the root object inside the buffer.
var MSG = RemoteSupport.Test.Message.getRootAsMessage(buf);

console.log(MSG.Body(1));
 */
