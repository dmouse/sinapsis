import moment from 'moment';
import 'moment/locale/es';
import { saveAs } from 'file-saver';
moment.locale('es');
var ntol = require('number-to-letter');
var slugify = require('slugify');
var JSZip = require("jszip");
const uuidv4 = require('uuid/v4');

export default class DbFactory {

  /**
  * Construye la clase a partir de un array
  *
  * @param array
  * @return void
  **/
  constructor(DbInfo){
    if(!DbInfo){
      DbInfo = [];
      console.error('Sinapsis: No hay ninguna estructura de formulario seleccionada. Esto ocasionará errores inesperados.');
    }
    this.classVersion = '0.0.1';
    this.version = 0;
    this.saves = 0;
    this.manualSaves = 0;
    this.originalData = DbInfo;
  }

  /**
  * Crea un objeto que después podrá ser exportado
  *
  * @param void
  * @return obj
  **/
  set(){
    this.obj = {
      info: {
        name: 'Proyecto sin nombre',
        slug: 'proyecto-sin-nombre'
      },
      projectStructure: this.originalData,
      classVersion: this.classVersion,
      saves: 0,
      modified: false,
      version: this.version
    };
    return this.setCreated();
  }

  /**
  * Establece la fecha inicial
  *
  * @param void
  * @return obj
  **/
  setCreated(){
    if(this.obj.created){
      return this.obj;
    }
    var created = moment.now();
    this.obj.created = created;
    return this.obj;
  }

  /**
  * Establece el nombre de la base
  *
  * @param string
  * @return obj
  **/
  setName(v){
    var o = this.obj;
    if(!o.info){
      o.info = {};
    }
    o.info.name = v;
    o.info.slug = slugify(v, {lower: true});
    this.obj = o;
    this.setModified();
    return o;
  }

  /**
  * Establece la fecha de modificación
  *
  * @param void
  * @return obj
  **/
  setModified(){
    var modified = moment.now();
    this.obj.modified = modified;
    this.version++;
    this.obj.version = this.version;
    return this.obj;
  }

  /**
  * Obtiene el timestamp de modificación
  *
  * @param void
  * @return int | false
  **/
  getModified(){
    return this.obj.modified;
  }

  /**
  * Normaliza la base de datos y la desanida
  *
  * @param void
  * @return array
  **/
  normalize(){
    var o = [];
    var d = this.originalData;
    for(var i = 0; i < d.length; i++){
      var e = d[i];
      var has_groups = e.groups;
      if(has_groups){
        var branchName = e.name;
        for(var j = 0; j < e.groups.length; j++){
          var group = e.groups[j];
          /* Determina si tiene subgrupos */
          if(!group.groups){
            var inputs = this.getGroupInputs(group, branchName);
            o = [...o, ...inputs];
          }else{
            for(var k = 0; k < group.groups.length; k++){
              var subgroup = group.groups[k];
              var inputs = this.getGroupInputs(subgroup, branchName);
              o = [...o, ...inputs];
            }
          }
        }
      }else{
        var inputs = e.inputs.map(function(i){
          i.branchName = e.name;
          i.groupName = e.name;
          return i;
        })
        o = [...o, ...inputs];
      }
    }
    return o;
  }

  /**
  * Obtiene los inputs de un grupo
  *
  * @param array group
  * @return array
  **/
  getGroupInputs(group, branchName){
    var o = [];
    var groupName = group.name;
    var inputs = group.inputs;
    if(!inputs){
      var inputs = group.inputGroup.inputs;
    }
    if(inputs){
      for(var k = 0; k < inputs.length; k++){
        var input = inputs[k];
        input.branchName = branchName;
        input.groupName = groupName;
        o.push(input);
      }
    }
    return o;
  }

  /**
  * Obtiene el objeto principal
  *
  * @param void
  * @return object
  **/
  getMainObject(){
    var g = this.originalData;
    var f = g.filter(function(g){
      return g.ismain ? true : false;
    });
    return f[0];
  }

  /**
  * Obtiene el tamaño aproximado del objeto
  *
  * @param void
  * @return int bits
  **/
  getObjectSize(){
    var j = JSON.stringify(this.obj);
    return j.length;
  }

  /**
  * Construye un archivo .sinapsis
  *
  * @param void
  * @return Blob
  **/
  createProjectFile(){
    var d = this.obj;
    d.snps = 1921;
    d.savedAt = moment.now();
    d.saves = d.saves + 1;
    var j = JSON.stringify(d);
    var o = btoa(j);
    var txt = o;
    var kbsize = txt.length * 0.000125;

    var name = d.info.slug + '_v'+ d.version + '_b_' + d.saves;
    var zip = new JSZip();

    zip.file(name + '.sinapsis', txt, {base64: true});

    zip.generateAsync({type: "blob"})
    .then(function(content) {
        saveAs(content, name + ".zip");
    });
  }

  /**
  * Obtiene las bases de datos
  *
  * @param void
  * @return array
  **/
  getDbs(){
    var dbs = this.obj.dbs;
    if(!dbs){
      dbs = {};
    }
    return dbs;
  }

  /**
  * Crea un uid
  *
  * @param void
  * @return string
  **/
  createUid(){
    return uuidv4();
  }

  /**
  * Crea una base de datos
  *
  * @param void
  * @return uid
  **/
  addDb(){
    var dbs = this.getDbs();
    var x = Object.values(dbs).length;
    var uid = this.createUid();
    var o = {
      id: uid,
      name: 'BD #'+ (x+1)
    }
    dbs[uid] = o;
    this.setModified();
    this.obj.dbs = dbs;
    return uid;
  }

  /**
  * Reemplaza el objeto de la base de datos
  *
  * @param uid
  * @return dbs
  **/
  editDb(uid, db){
    var dbs = this.getDbs();
    dbs[uid] = db;
    this.setModified();
    return dbs;
  }

  /**
  * Obtiene la base de datos
  *
  * @param uid
  * @return obj
  **/
  getDb(uid){
    var dbs = this.getDbs();
    return dbs[uid];
  }


}
