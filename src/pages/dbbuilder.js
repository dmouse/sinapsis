import React from 'react'
import TextField from '@material-ui/core/TextField';
import Fab from '@material-ui/core/Fab';
import Icon from '@material-ui/core/Icon';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import moment from 'moment';
import 'moment/locale/es';
import CircularProgress from '@material-ui/core/CircularProgress';

/** Componentes **/
import DbFactory from '../funcs/dbClass';
import DbBuilderToolbar from '../parts/dbbuilder/toolbar';
import DbEditEmpresa from '../parts/dbbuilder/edit';
import DbViz from '../parts/dbviz/dbviz';

import buildLink from "../funcs/buildlink";

var dbf = new DbFactory();
var dbf_obj = dbf.set();
window.dbf = dbf;

var store = require('store')
var onDrawerToggle = new Event('sinapsisDrawerToggle');


export default class DbBuilderPage extends React.Component{
  state = {
    control: '',
    showcontrol: true,
    recoveroptions: [],
    showrecoveroptions: false,
    isautosaving: false
  }

  componentDidMount(){
    this.startAutosave();
    var uid = this.props.match.params.dbid;
    if(uid){
      var obj = store.get('sinapsis_'+uid);
      if(obj){
        var obj_j = JSON.parse(obj);
        if(!obj_j.recovered){
          obj_j.recovered = 0;
        }
        obj_j.recovered = obj_j.recovered + 1;
        obj_j.recoveredAt = moment.now();
        window.dbf.obj = obj_j;
        this.setState({
          showcontrol: false,
          showrecoveroptions: false
        })
      }else{
        var url = buildLink('/construir');
        this.props.history.push(url);
      }
    }
  }

  componentWillUnmount(){
    clearInterval(this.autosaveint);
  }

  startAutosave(){
    var self = this;
    var maxkbsize = 4000;
    window.addEventListener('sinapsisModified', function(){
      var isok = !self.state.showcontrol && window.dbf.obj.allowAutoSave;
      if(isok){
        self.setState({
          isautosaving: true
        })
        clearTimeout(self.autosavingT);
        var f = dbf.getAutoSaveFile();
        var s = f.length;
        var kbsize = s * 0.000125;
        if(kbsize < maxkbsize){
          var ky = 'sinapsis_' + dbf.obj.uid;
          store.set(ky, f);
          self.autosavingT = setTimeout(function(){
            self.setState({
              isautosaving: false
            })
          }, 1000)
        }
      }
    });
  }

  startNewProject(){
    var obj = window.dbf.set();
    var url = buildLink('/construir/' + obj.uid);
    this.props.history.push(url);

    this.setState({
      control: 'newproject',
      showcontrol: false
    })
  }

  loadFile(e){
    this.setState({
      isloading: true
    })
    var self = this;
    var em = document.getElementById('ss_file_input');
    var f = em.files;
    if(f[0]){
      var file = f[0];
      var reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = function(ev){
        var t =  ev.target.result;
        var obj = window.dbf.setFile(t);
        var url = buildLink('/construir/' + obj.uid);
        self.props.history.push(url);
        self.setState({
          control: 'fromfile',
          showcontrol: false
        })
      }
    }
  }

  intentToRecover(){
    var possibleDbs = [];
    store.each(function(value, key){
      if(key.indexOf('sinapsis_') > -1){
        var o = JSON.parse(value);
        possibleDbs.push(o);
      }
    })
    this.setState({
      showrecoveroptions: true,
      recoveroptions: possibleDbs
    })
  }

  selectRecoveredProject(){
    var uid = this.state.selectedToRecover;
    if(!uid){
      return;
    }
    var obj = store.get('sinapsis_'+uid);
    var obj_j = JSON.parse(obj);
    if(!obj_j.recovered){
      obj_j.recovered = 0;
    }
    obj_j.recovered = obj_j.recovered + 1;
    obj_j.recoveredAt = moment.now();
    window.dbf.obj = obj_j;

    this.props.history.push('/construir/' + obj_j.uid);
    this.setState({
      showcontrol: false,
      showrecoveroptions: false
    })
  }

  render(){
    var self = this;
    return(
      <div className="ss_page">
        {
          this.state.showcontrol ?
            <div>
              <div className="ss_dbbuilder_front">
                <div className="ss_db_choose">
                  <div className="ss_db_choose_td" onClick={() => this.startNewProject()}>
                    <Icon>add</Icon>
                    <div className="ss_db_choose_td_label">
                      Nuevo proyecto<br/><span>Comienza un proyecto desde cero</span>
                    </div>
                  </div>
                  <div className="ss_db_choose_td">
                    <input
                      type="file"
                      accept=".sinapsis"
                      id="ss_file_input"
                      onChange={(e) => this.loadFile(e)}
                    />
                    <Icon>publish</Icon>
                    <div className="ss_db_choose_td_label">
                      Cargar proyecto<br/><span>Sube tu archivo .sinapsis</span>
                    </div>
                  </div>
                  <div className="ss_db_choose_td" onClick={() => this.intentToRecover()}>
                    <Icon>restore</Icon>
                    <div className="ss_db_choose_td_label">
                      Recuperar proyecto<br/><span>Desde la memoria de tu navegador.</span>
                    </div>
                  </div>
                  <div className="ss_db_choose_td">
                    <Icon>play_arrow</Icon>
                    <div className="ss_db_choose_td_label">
                      Iniciar demo<br/><span>Utiliza la base de datos de La Estafa Maestra</span>
                    </div>
                  </div>
                </div>
              </div>
              <Dialog
                  disableBackdropClick
                  disableEscapeKeyDown
                  maxWidth="xs"
                  open={this.state.showrecoveroptions}
                >
                  <DialogTitle id="confirmation-dialog-title">Selecciona un proyecto</DialogTitle>
                  <DialogContent dividers>
                    <RadioGroup
                      onChange={(e) => self.setState({ selectedToRecover: e.target.value})}
                    >
                    {
                      this.state.recoveroptions.map(option => (
                        <FormControlLabel value={option.uid} key={option.uid} control={<Radio />} label={option.info.name} />
                      ))
                    }
                    </RadioGroup>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => this.setState({showrecoveroptions: false})} color="primary">
                      Cancelar
                    </Button>
                    <Button disabled={this.state.selectedToRecover ? false : true} onClick={() => this.selectRecoveredProject()} color="primary">
                      Seleccionar
                    </Button>
                  </DialogActions>
                </Dialog>
            </div>
          :
            <div>
              <DbBuilderToolbar parent={this} ref={(ref) => this.toolbar = ref}/>
              {
                this.state.isautosaving ?
                <div id="ss_autosave_indicator">
                  <CircularProgress disableShrink color="primary" size={30}/>
                </div>
                : null
              }
              <div className="ss_dbbuilder">
                <DbBuilderSidebar />
                <DbViz />
              </div>
            </div>
        }
      </div>
    )
  }
}

class DbBuilderSidebar extends React.Component{
  state = {
    dbs: [],
    uid: '',
    db: null
  }
  componentDidMount(){
    this.fetchDbs();
    this.refs = {};
  }

  componentDidUpdate(p, s){
    var dbf = window.dbf;
    var uid = dbf.obj.uid;

    if(uid !== s.uid){
      this.fetchDbs();
    }
  }
  fetchDbs(){
    var dbf = window.dbf;
    this.setState({
      uid: dbf.obj.uid,
      dbs: dbf.getDbs(),
      db: false
    })
  }

  addDB(){
    var self = this;
    var dbf = window.dbf;
    var dbId = dbf.addDb();
    this.fetchDbs();
    setTimeout(function(){
      self.refs[dbId].handleClick();
    }, 10);
  }

  selectDb(uid){
    var dbf = window.dbf;
    var db = dbf.getDb(uid);
    window.dbf.obj.selectedDb = uid;
    this.setState({
      db: db
    })
  }

  render(){
    var self = this;
    var navCs = ['ss_dbbuilder_sidebar_dbs_nav'];
    var dbsA = Object.values(this.state.dbs);
    if(dbsA.length > 1){
      navCs.push('ss_overflow');
    }
    return(
      <div className="ss_dbbuilder_sidebar">
        <div className="ss_dbbuilder_sidebar_dbs">
            <div className={navCs.join(' ')}>
              {
                dbsA.map(function(db, k){
                  return <DbDbsNavigationTd ref={(ref) => self.refs[db.id] = ref} parent={self} key={k} db={db} />
                })
              }
              <DbDbsNavigationNewDb parent={this}/>
            </div>
            <div className="ss_dbbuilder_sidebar_dbs_view">
              {
                this.state.db ?
                <DbView db={this.state.db} navRef={this.refs[this.state.db.id]} parent={self}/>
                : null
              }
            </div>
        </div>
      </div>
    )
  }
}

class DbView extends React.Component{
  state = {
    showdialog: false,
    dialogValue: '',
    showDeleteDialog: false
  }
  componentDidMount(){
    this.set();



  }

  componentDidUpdate(p, n){
    if(p.db.id !== this.props.db.id){
      this.set();
    }
  }

  set(){
    var db = this.props.db;
    this.setState({
      db: db,
      nameError: !db.name
    })
  }

  handleNameChange(e){
    var v = e.target.value;
    var db = this.state.db;
    var error = v ? false : true;
    db.name = v;
    this.props.navRef.setState({
      name: v,
      nameError: error
    })
    this.setState({
      db: db,
      nameError: error
    })
    window.dbf.editDb(db.id, db);
  }

  showAddDialog(){
    var self = this;
    this.setState({
      showdialog: true
    })
    window.addEventListener("keypress", function _keyupListener(e){
      if(e.keyCode == 13 && self.state.dialogValue && self.state.showdialog){
        self.addEmpresa();
      }
    }, true);
  }


  handleDialogClose(){
    this.setState({
      showdialog: false,
      dialogValue: ''
    })
  }

  addEmpresa(){
    var v = this.state.dialogValue;
    this.handleDialogClose();
    var data = window.dbf.addEmpresaToDb(this.state.db, v);
    this.empresalist.selectEmpresa(data[1])
    this.setState({
      db: data[0]
    })
  }

  intentDelete(){
    this.setState({
      showDeleteDialog: true
    })
  }

  delete(){
    window.dbf.deleteDb(this.state.db);
    this.props.parent.fetchDbs();
    this.setState({
      showDeleteDialog: false
    })
  }

  render(){
    var dbf = window.dbf;
    var nameCs = ['ss_db_view_name'];
    if(this.state.nameError){
      nameCs.push('ss_error');
    }
    var canAdd = this.state.dialogValue.length > 0;
    return(
      <div className="ss_db_view">
        {
          this.state.db ?
          <div>
            <div className={nameCs.join(' ')}>
              <Icon style={{color: this.state.db.color}}>dns</Icon>
              <input
                type="text"
                value={this.state.db.name}
                onChange={(e) => this.handleNameChange(e)}
              />
            <IconButton size="small" onClick={() => this.intentDelete()}>
                <Icon>delete</Icon>
              </IconButton>
            </div>

            <Dialog open={this.state.showDeleteDialog} onClose={() => this.setState({ showDeleteDialog: false})}>
              <DialogTitle>¿Estás segurx?</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Se borraran todos los datos que hayas insertado.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button color="primary" onClick={() => this.setState({ showDeleteDialog: false})}>
                  Cancelar
                </Button>
                <Button color="primary" onClick={() => this.delete()}>
                  Continuar
                </Button>
              </DialogActions>
            </Dialog>

            <div className="ss_db_view_empresas">
              <div className="ss_db_view_empresas_title">
                <span>Empresas en la base</span>
                <div className="ss_db_view_empresas_title_btn" style={{cursor: 'pointer'}} onClick={() => this.showAddDialog()}>Agregar</div>
              </div>
              <DbEmpresasList ref={(ref) => this.empresalist = ref} parent={this} db={this.state.db} />
            </div>

          </div>
          : null
        }
        <Dialog open={this.state.showdialog} onClose={() => this.handleDialogClose()}>
          <DialogTitle id="form-dialog-title">Empresa nueva</DialogTitle>
            <DialogContent style={{width: 400}}>
            <DialogContentText>
              Escribe el nombre de la empresa, más adelante podrás añadir el resto de información.
            </DialogContentText>
            <TextField
              autoFocus
              label="Razón social de la empresa"
              fullWidth
              onChange={(e) => this.setState({dialogValue: e.target.value})}
            />
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={() => this.handleDialogClose()}>
              Cerrar
            </Button>
            <Button color="primary" disabled={!canAdd} onClick={() => this.addEmpresa()}>
              Agregar
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

class DbEmpresasList extends React.Component{
  state = {
    showedit: false,
    empresa: {}
  }

  componentDidUpdate(p, s){
    if(p.db.id !== this.props.db.id){
      this.setState({
        forcerender: 2,
        showedit: false,
        empresa: {}
      })
    }
  }

  selectEmpresa(em){
    this.setState({
      showedit: true,
      empresa: em
    })
    window.dispatchEvent(onDrawerToggle);
    window.dbf.obj.selectedEmpresa = em.uid;
  }

  closeDrawer(){
    this.setState({
      showedit: false,
      empresa: {}
    })
    window.dispatchEvent(onDrawerToggle);
    window.dbf.obj.selectedEmpresa = '';
  }

  deleteEmpresa(uid){
    window.dbf.deleteEmpresa(this.props.db, uid);
    this.closeDrawer();
  }

  render(){
    var self = this;
    var db = this.props.db;
    var em = db.empresas;
    if(em){
      var hasEmpresas = Object.values(em).length > 0;
    }else{
      var hasEmpresas = false;
    }
    return(
      <div className="ss_db_ve_c">
        {
          hasEmpresas ?
          <div className="ss_db_ve_c_empresas_list">
            {
              Object.values(em).map(function(empresa, k){
                return(
                <DbEmpresa
                    empresa={empresa}
                    db={db}
                    key={k}
                    index={k}
                    parent={self}
                    active={self.state.empresa.uid == empresa.uid}
                />)
              })
            }
          </div>
          :
          <div className="ss_db_ve_c_nocontent">
            <div className="ss_db_ve_c_nocontent_icon">
              <Icon>dns</Icon>
            </div>
            <div className="ss_db_ve_c_nocontent_des">
              <p>Sin empresas</p>
              <div className="ss_db_ve_c_nocontent_des_cta">
                <a href="#" onClick={() => this.props.parent.showAddDialog()}>Agregar empresa</a>
              </div>
            </div>
          </div>
        }
        {
          this.state.showedit ?
          <div className="db_empresa_edit">
            <DbEditEmpresa db={this.props.db} empresa={this.state.empresa} parent={this} />
          </div>
          : null
        }
      </div>
    )
  }
}

class DbEmpresa extends React.Component{
  state = {
    showedit: false
  }

  componentDidUpdate(){
  }

  handleClick(){
    window.scroll(0, 0);
    this.props.parent.selectEmpresa(this.props.empresa);
  }

  render(){
    var e = this.props.empresa;
    var cs = ['db_empresa'];
    if(!e.fields){
      cs.push('ss_new');
    }

    if(this.props.active){
      cs.push('ss_active');
    }

    var fieldsSize = 1;
    if(e.fields){
      fieldsSize += e.fields.length;
    }
    return(
      <div className={cs.join(' ')} data-slug={e.slug}>
        <div className="db_empresa_container" onClick={() => this.handleClick()}>
          <div className="db_empresa_container_indicator"></div>
          <div className="db_empresa_container_name">
            {this.props.index + 1 +'. '} {e.name}
          </div>
          <div className="db_empresa_container_info">

          </div>
        </div>

      </div>
    )
  }
}

class DbDbsNavigationNewDb extends React.Component{
  render(){
    return(
      <div className="ss_dbbuilder_sidebar_dbs_nav_td ss_db_newdb" onClick={() => this.props.parent.addDB()}>
        <Icon>add</Icon><span className="ss_db_nav_s">Nueva base de datos</span>
      </div>
    )
  }
}

class DbDbsNavigationTd extends React.Component{
  state = {
    name: '',
    isblurred: true
  }
  componentDidMount(){
    this.set();
  }
  set(){
    var db = this.props.db;
    this.setState({
      name: db.name
    })
  }
  handleClick(e){
    var all_actives = document.querySelectorAll('.ss_dbbuilder_sidebar_dbs_nav_td.ss_active');
    if(all_actives){
      for(var i = 0; i < all_actives.length; i++){
        var em = all_actives[i];
        em.classList.remove('ss_active');
      }
    }
    var db = this.props.db;
    var em_id = 'ss_nav_' + db.id;
    var em = document.getElementById(em_id);
    em.classList.add('ss_active');
    this.props.parent.selectDb(db.id);

  }

  render(){
    var db = this.props.db;
    return (
      <div
        id={'ss_nav_'+db.id}
        className="ss_dbbuilder_sidebar_dbs_nav_td"
        onClick={(e) => this.handleClick(e)}
        >
        <div className="ss_dbbuilder_sidebar_dbs_nav_td_input" title={this.state.name}>
          <div className="ss_dbtab_circle" style={{backgroundColor: db.color}}></div><span>{this.state.name}</span>
        </div>
      </div>
    )
  }
}
