const express=require('express');
const app=express();
const morgan=require('morgan');
const multer=require('multer');
const {mongoose}=require('./ConexionDB.js');

//MODELOS Canal Indirecto
const Datos=require('./ModelosDatos/profit_users.js');
const AgendaTrabajo=require('./ModelosDatos/profit_agenda_trabajo.js');
const DatosCapturados=require('./ModelosDatos/datos_capturados.js');
const EstadisticasMercaderista=require('./ModelosDatos/profit_estadistica.js');
const UsuariosSupervisoresIndirecto=require('./ModelosDatos/profit_usersSupervisoresIndirectos.js');

//Canal Indirecto Imagenes
var storage=multer.diskStorage({
	destination:function(req,file,cb){
		cb(null,'../imagenesindirecto/');
	},
	filename:function(req,file,cb){
		cb(null,new Date().toISOString()+file.originalname)
	}
});
const upload=multer({storage:storage,limits:{fileSize:1024*1024*100}});

//Middlewares
app.use(express.json());
app.use(morgan('combined'));
app.use(express.static('Sistemas'));
app.use(express.urlencoded());

//PROFIT CANAL INDIRECTO
//---------------------------------------------------------------------
/*gettesr*/
app.get('/api/profit_usuarios/:identificador',async (req,res)=>{
	/*Esta función se utiliza para conseguir el usuario{mercaderista} y sus datos.
	Esto para lograr realizar el loggin a la aplicación mobile*/
	const mercaderista=req.params.identificador;
	const datos=await Datos.find({identificador:mercaderista});
	console.log(datos);
	res.json(datos);
});

app.get('/api/profit_agenda_trabajo/:identificador',async (req,res)=>{
	/*Esta función se utiliza para conseguir la agenda de trabajo del mercaderista.
	La misma se le es cargada a la aplicación mobile.*/
	const mercaderista=req.params.identificador;
	const agendatrabajo=await AgendaTrabajo.find({identificador:mercaderista});
	console.log(agendatrabajo);
	res.json(agendatrabajo);
});

app.get('/api/profit_datos_capturados',async (req,res)=>{
	/*Esta función se utiliza para cargar la data capturada por el
	mercaderista durante su trabajo de campo*/
	const datoscapturados=await DatosCapturados.find();
	console.log(datoscapturados);
	res.json(datoscapturados);
});

app.get('/api/profit_mercaderistasSupervisor/:identificador',async (req,res)=>{
	const supervisor=req.params.identificador;
	const datos=await Datos.find({supervisor:supervisor});
	console.log(datos);
	res.json(datos);
});

app.get('/api/profit_estadisticas/:identificador',async (req,res)=>{
	/*Esta función se utiliza para obtener las estadisticas ya cargadas al servidor*/
	const mercaderista=req.params.identificador;
	const Fecha=new Date();
	const FechaConsulta=new Date(Fecha.getFullYear(),Fecha.getMonth());
	const objetoEncuesta=await DatosCapturados.find({id:mercaderista,fechaInserccion:{$gt:FechaConsulta},tipoEncuesta:"Encuesta"}).count();
	const objetoformulario=await DatosCapturados.find({id:mercaderista,fechaInserccion:{$gt:FechaConsulta},tipoEncuesta:"FormularioPrecios"}).count();
	objeto={
		EncuestaColmado:objetoEncuesta,
		FormularioPrecios:objetoformulario
	}
	console.log(objeto);
	res.json(objeto);
});

/*setter*/
app.post('/api/profit_insertar_usuarios',async (req,res)=>{
	/*Esta función se utiliza para insertar usuarios en la aplicacion*/
	const {
		identificador,
		nombre,apellido,
		password,zona,
		supervisor,
		es_supervisor,
		cantCampos,
		cantCamposForm,
		estadoColmado,
		dispColmadero,
		dispColmaderoSiNo,
		tipoAccesoColmado,
		tamanoColmado,
		capacidadColmadoSiNo,
		tipoVentana,
		iniciativasVisibilidad,
		surtidoColmado,
		actividadCompetitiva,
		cuidadoOral,
		cuidadoPersonal,
		cuidadoHogar}=req.body
	try
	{
		await Datos.deleteMany({identificador:identificador},function(err){
			if(err) return handleError(err);
		});
	}
	catch(e)
	{
		console.log(e)
	}

	const datos=new Datos(
		{identificador,
			nombre,apellido,
			password,
			zona,
			supervisor,
			cantCampos,
			cantCamposForm,
			es_supervisor,
			estadoColmado,
			dispColmadero,
			dispColmaderoSiNo,
			tipoAccesoColmado,
			tamanoColmado,
			capacidadColmadoSiNo,
			tipoVentana,
			iniciativasVisibilidad,
			surtidoColmado,
			actividadCompetitiva,
			cuidadoOral,
			cuidadoPersonal,
			cuidadoHogar});

	console.log(datos);
	await datos.save();
	res.json('recibido');
});

app.post('/api/profit_insertar_usuariosSupervisoresIndirecto',async(req,res)=>{
	/* Esta funcion se utiliza para insertar usuarios a los supervisores */
	const {
		identificador,
		nombre,
		apellido,
		password
	}=req.body

	try{
		UsuariosSupervisoresIndirecto.deleteMany({identificador:identificador},function(err){
			if(err){console.log("Error al Insertar usuario supervisor indirecto")}
		})
	}catch(e){
		console.log(e);
	}

	const usuariosupervisor=new UsuariosSupervisoresIndirecto({identificador,nombre,apellido,password});
	await usuariosupervisor.save();
	res.json('recibido');
})

app.post('/api/profit_insertar_agenda',async(req,res)=>{
	/*Esta función se utiliza para insertar la agenda de los mercaderistas*/
	const {identificador,
		nombre,
		apellido,
		fecha,
		colmados,
		colmadosFormPrecios}=req.body
	try
	{
		AgendaTrabajo.deleteMany({identificador:identificador},function(err){
			if(err) return handleError(err);
		});
	}
	catch(e)
	{
		console.log(e);
	}
	const agendatrabajo=new AgendaTrabajo({identificador,nombre,apellido,fecha,colmados,colmadosFormPrecios});
	console.log(agendatrabajo);
	await agendatrabajo.save();
	res.json('recibido');
});

app.post('/api/profit_datos',async(req,res)=>{
	/*Esta función se utiliza para insertar los datos en el servidor. Los
	datos capturados en el cell del mercaderista son insertados al serivdor mediante
	esta función*/
	const {id,encuesta,tipoEncuesta}=req.body;
	const datoscapturados=new DatosCapturados({id,encuesta,tipoEncuesta});
	console.log(datoscapturados);
	await datoscapturados.save();
	res.json('recibido');
});

app.post('/api/profit_insertar_estadisticas',async(req,res)=>{
	const {identificador,cantidad_realizada,cantidad_faltante}=req.body;
	try{
	        await EstadisticasMercaderista.deleteMany({identificador:identificador},function(err){
        	        if(err) return handleError(err);
	        });
	}catch(e){
		console.log(e)
	}
	const datoscapturados=new  EstadisticasMercaderista({identificador,cantidad_realizada,cantidad_faltante});
	console.log(datoscapturados);
	await datoscapturados.save();
	res.json('recibido');
});

app.post('/api/profit_insertar_imagenes',upload.single('foto_colmados'),async(req,res)=>{
	console.log(req.file);
	res.json('recibido');
});

//GENERALES
//---------------------------------------------------------------------
app.get('*',(req,res)=>{
	res.end('Esta ruta no existe. Favor verificar la url');
});

//Servidor
app.listen(80,function(){console.log('Servidor funcionando...')});
