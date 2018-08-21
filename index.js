let express = require('express');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io')(server);

// Static Files
app.use(express.static(__dirname+ '/public'));

// App setup
server.listen(4000, () =>{
	console.log("Berhasil merequest server di port 4000 !!");
});


let jumlahUser = 0;
let kumpulanUser = {};
let userMengetik = [];

function cekSedangMengetik(v){
	if(userMengetik.indexOf(v) >= 0){
		return userMengetik;
	}else{
		userMengetik.push(v);
	}
	return userMengetik;
}

function hapusArray(array, v){	
	array.filter((item) => {
		return item !== v;
	});	
}

function cekUser(v){
	let val = '';
	for(let key in kumpulanUser){
		if(key === v){
			val = key;
		}
	}
	return val;
}

io.on('connection', (socket) =>{
	
	socket.on('userConnect', (data) => {
		if(cekUser(data) === ''){
			socket.username = data;
			kumpulanUser[data] = socket.id;
			jumlahUser++;
			socket.emit('setUser',{
				'userName' : data,
				'userID' : socket.id
			});
			
			io.emit('updateUser', {
				'jumlahUser' : jumlahUser,
				'kumpulanUser': kumpulanUser
			});
					
			console.log(kumpulanUser);
			console.log(jumlahUser);
			
		}else{
			console.log(kumpulanUser);
			socket.emit('userExist', 'userName "' + data + '" sudah ada sebelumnya !!');
		}
	});
	
	socket.on('reloadData', (data) => {
		if(cekUser(data.userNameSocket) === ''){
			kumpulanUser[data.userNameSocket] = data.userIDSocket;
			jumlahUser++;
		}
		io.emit('updateUser', {
			'jumlahUser' : jumlahUser,
			'kumpulanUser': kumpulanUser
		});	

		console.log(kumpulanUser);
		console.log(jumlahUser);
	});
	
	socket.on('userLogout', (data) => {
		delete kumpulanUser[data.userName];
		if(jumlahUser != 0){
			jumlahUser--;
		}		
		io.emit('updateUser', {
			'jumlahUser' : jumlahUser,
			'kumpulanUser': kumpulanUser
		});
		
		io.emit('laporanLogout', true);		
		io.emit('cekChatPrivate', data.userName);
		
		console.log(data.userName + " with userID = " + data.userID+ " has been disconnect.");
		console.log(kumpulanUser);
	});
	
	socket.on('grupKeypress',(data) =>{
		socket.broadcast.emit('ongrupKeypress', cekSedangMengetik(data));
	});
	
	socket.on('kirimPesanGrup', (data) => {
		hapusArray(userMengetik, data.pengirim);
		socket.broadcast.emit('ongrupKeypress', userMengetik);
		io.emit('pesanGrup', data);
	})
		
});
