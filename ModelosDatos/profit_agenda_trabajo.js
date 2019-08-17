const mongoose=require('mongoose');
const {Schema}=mongoose;

const agendaProfitSchema=new Schema({
	identificador:{type:Number,required:true},
	nombre:{type:String,required:true},
	apellido:{type:String,required:true},
	fecha:{type:Date,required:true},
	colmados:{type:Array,required:true},
	colmadosFormPrecios:{type:Array,required:false}
});

module.exports=mongoose.model('agenda_profit',agendaProfitSchema);
