// Membuat koneksi
let socket = io.connect(document.location.origin);

let myUsername = '';
let userMengetik = [];

function loggin(){
	if (typeof(Storage) !== "undefined") {
		if(localStorage.userIDSocket == null && localStorage.userNameSocket == null){
			let pertama = prompt("Siapa nama Anda? ");
			if(pertama != null){
				socket.emit('userConnect', pertama);
			}else{
				window.open("about:blank",'_self').close();
			}
		}else{
			alert("Selamat datang kembali "+ localStorage.userNameSocket + "\nHave a nice day :D !!");
			myUsername = localStorage.userNameSocket;
			socket.emit('reloadData', {
				'userNameSocket' : localStorage.userNameSocket,
				'userIDSocket' : localStorage.userIDSocket
			});
			$("span.myusername").html(myUsername);
			$("span.myusername").html(myUsername);
			$("#userOnline li:first").html(myUsername);
		}
	} else {
		alert("Browser anda tidak mendukung untuk menyimpan data pribadi anda. \nKemungkinan data pribadi akan terus hilang.\nSilahkan lanjutkan..");
	}
}

function logout(){
	if(confirm("Apakah anda yakin ingin keluar dari aplikasi chat yang kece ini?")){
		socket.emit('userLogout', {
			'userName' : localStorage.userNameSocket,
			'userID' : localStorage.userIDSocket
		});
		localStorage.removeItem
	}
}

$(function(){
	socket.on('connect', () => {
		loggin();
	});

	socket.on('laporanLogout', (data) =>{
		if(data == true){
			localStorage.removeItem('userNameSocket');
			localStorage.removeItem('userIDSocket');
			alert("Logout berhasil!!");
			window.open("about:blank",'_self').close();
		}
	});

	socket.on('setUser', (data) => {
		localStorage.setItem('userIDSocket', data.userID);
		localStorage.setItem('userNameSocket', data.userName);
		$("span.myusername").html(data.userName);
		$("#userOnline li:first").html(data.userName);
		myUsername = data.userName;
	})

	socket.on('updateUser', (data) =>{
		$("#jumlahOnline").html(data.jumlahUser);
		$('ul#userOnline li').not('li:first').remove();
		$.each(data.kumpulanUser, function(key, value) {
			if(key !== myUsername) {
				$("#userOnline").append('<li class="list-group-item btn" onclick="startChat(\'' + key +'\')">' + key + '</li>');
			}
		});
	});

	socket.on('userExist', (data) => {
		if(confirm(data + "\nMau coba lagi dengan nama lain?")){
			loggin();
		}else{
			window.open("about:blank",'_self').close();
		}
	});

	socket.on('cekChatPrivate', (data) => {
		if($('span#penerima').text() == data){
			$('span#penerima').html('None');
			$('#isiChatPrivate').attr("disabled", "disabled");
			$('#btnChatPrivate').attr("disabled", "disabled");
		}
	});

	// Menampilkan keterangan "sedang mengetik" ketika user sedang mengetik
	$('#isiChatGrup').on('keypress', () => {
		socket.emit('grupKeypress', myUsername);
	});

	socket.on('ongrupKeypress', (data) => {
		userMengetik = data.filter(item => item != myUsername);
		if(userMengetik.length == 0){
			$('#feedbackChatGrup').html('');
		}else{
			$('#feedbackChatGrup').html('<p><em>'+ userMengetik.join(', ') +' sedang mengetik..</em></p>');
		}
	});

	$('#btnChatGrup').on('click', () => {
		if($('#isiChatGrup').val() == ''){
			alert("Pesan tidak boleh kosong!");
		}else{
			socket.emit('kirimPesanGrup', {
				'pengirim' : myUsername,
				'pesan': $('#isiChatGrup').val()
			});
			$('#isiChatGrup').val('');
		}
	});

	socket.on('pesanGrup', (data) => {
		if(data.pengirim == myUsername){
			$('#outputChatGrup').append('<p style="text-align: right;"> '+ data.pesan + ' : <b>' + data.pengirim + ' </b></p>');
		}else{
			$('#outputChatGrup').append('<p><b>' + data.pengirim + ' </b> : '+ data.pesan + '</p>');
		}
	});
});

function startChat(key){
	if(confirm("Apakah anda ingin memulai chat dengan " + key + " ?")){
		$('span#penerima').html(key);
		$('#isiChatPrivate').removeAttr("disabled");
		$('#btnChatPrivate').removeAttr("disabled");
	}
}
