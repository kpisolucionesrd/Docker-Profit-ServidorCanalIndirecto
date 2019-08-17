const mongoose=require('mongoose');
const {Schema}=mongoose;

const estadisticaProfitSchema=new Schema({
	identificador:{type:Number,required:true},
	cantidad_realizada:{type:String,required:true},
	cantidad_faltante:{type:String,required:true},
});

module.exports=mongoose.model('estadistica_profit',estadisticaProfitSchema);
