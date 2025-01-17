import React from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import DbInput from '../inputs';
import { _t } from '../../../vars/countriesDict';

const uuidv4 = require('uuid/v4');
var slugify = require('slugify');


export default class DbFormGroupPersonas extends React.Component{
  state = {
    open: false,
    isedit: false,
    personType: '-',
    fields: {},
    funcionario: false,
    modalChanged: false
  }

  componentDidMount(){
    this.refs = [];
    var self = this;
    window.addEventListener('keydown', function(e){
      var w = e.which;
      var bc = document.body.classList.contains('ss_focusing_input');
      if(w == 13 && !bc && self.state.open){
        self.add();
      }
    })

  }

  close(){
    this.setState({
      open: false,
      modalChanged: false,
      isEdit: false,
      personType: '-'
    })
  }

  open(guid){
    var self = this;
    var isEdit = false;
    if(!guid){
      guid = uuidv4();
    }else{
      isEdit = true;
    }
    this.setState({
      open: true,
      guid: guid,
      fields: {},
      isedit: isEdit
    })
  }

  setChildRef = e => {
    try{
      if(this.state.isedit){
        var guid = this.state.guid;
        e.setValueFromGuid(guid);
      }
    }catch(err){
      console.warn('Sinapsis warning', err);
    }

  }

  add(){
    var fs = this.state.fields;
    var dbuid = this.props.parent.props.db.id;
    var euid = this.props.empresa.uid;

    window.dbf.addFieldsFromGuid(dbuid, euid, this.state.guid, fs);
    this.close();
  }

  insertField(slug, obj, blockchanged){
    slug = this.state.guid + '-' + slug;
    var fs = this.state.fields;
    obj.guid = this.state.guid;
    obj.groupUid = this.state.guid;
    fs[slug] = obj;
    this.setState({
      fields: fs,
    })
    if(!blockchanged){
      this.setState({
        modalChanged: true
      })
    }
  }

  onSelectPersonType(e){
    var t = e.target.value;
    var preSlug = 'tipo persona';
    var slug = slugify(preSlug);
    var obj = {
      group: t,
      value: t,
      bigGroup: 'persona',
      isvalid: true,
      guid: this.state.guid,
      groupUid: this.state.guid,
      name: 'Tipo de persona'
    };
    this.setState({
      personType: t
    })
    this.insertField(slug, obj, true);
  }

  getGroup(type){
    if(!type){
      return [];
    }
    var dbuid = this.props.parent.props.db.id;
    var euid = this.props.empresa.uid;
    var gr = window.dbf.getEmpresaGroupsByGroup(dbuid, euid, type);
    return gr;
  }

  editPerson(guid, person){
    // console.log('GUID', guid, person);


    var e = person[0].group;
    this.setState({
      personType: e
    })
    this.open(guid);
  }

  render(){
    var self = this;
    var addL = this.state.isedit ? 'Guardar' : 'Agregar';
    var repLegales = this.getGroup('representante');
    var accionistas = this.getGroup('accionista');
    var administradores = this.getGroup('administrador');
    var comisarios = this.getGroup('comisario');
    var consejeros = this.getGroup('consejero')

    var totalp = repLegales.length + accionistas.length + administradores.length + comisarios.length + consejeros.length;


    var persons = [
      {
        name: 'Representantes legales',
        fields: repLegales
      },
      {
        name: 'Accionistas',
        fields: accionistas
      },
      {
        name: 'Administradores',
        fields: administradores
      },
      {
        name: 'Comisarios',
        fields: comisarios
      },
      {
        name: 'Consejeros',
        fields: consejeros
      }
    ];

    var funcionario = this.state.funcionario;

    return(
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<Icon>expand_more</Icon>}>
          <div className="dbef_n">
            <div className="dbef_n_n">
              Personas <span className="dbef_n_n_badge">{totalp}</span>
            </div>
            <div className="dbef_n_ctas">
              <div className="dbef_n_ctas_c" onClick={() => this.open()}>Agregar</div>
            </div>
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <div className="db_empresa_container_group_form">
            {
              persons.map(function(g){
                var cs = ['db_empresa_subgroup'];
                if(!g.fields.length){
                  cs.push('ss_empty');
                }
                return(
                  <div className={cs.join(' ')}>
                    <div className="db_empresa_subgroup_title">
                      {_t(g.name)}
                    </div>
                    <div className="db_empresa_subgroup_content db_empresa_container_group_form_innerlist">
                      {
                        g.fields.length ?
                          g.fields.map(function(p, i){
                            return <PersonRow p={p} i={i} parent={self} onClick={(g) => self.editPerson(g, p)}/>
                          })
                        :
                        null
                      }
                    </div>
                  </div>
                )
              })
            }

          </div>
        </ExpansionPanelDetails>

        {/* Modal */}
        <Dialog open={this.state.open} onClose={() => this.close()} className="ss_modal_edit">
          <DialogTitle>{addL} persona</DialogTitle>
          <DialogContent>
            <div className="db_empresa_container_group_form">
              {
                !this.state.isedit ?
              <div className="ss_db_input_select">
                {/* Selecciona el tipo de persona */}
                <select onChange={(e) => this.onSelectPersonType(e)}>
                  <option value="-" selected disabled>Selecciona un tipo de persona</option>
                  <option value="representante">Representante Legal</option>
                  <option value="accionista">{_t("Accionista")}</option>
                  <option value="administrador">{_t("Administrador")}</option>
                  <option value="comisario">{_t("Comisaria/o")}</option>
                  <option value="consejero">{_t("Conesjera/o")}</option>
                </select>
              </div>
              : null
              }
              {
                this.state.personType !== '-' ?
                  <>
                    <DbInput
                      onChange={(slug, obj) => this.insertField(slug, obj)}
                      matchWith={['person']}
                      name="Nombre completo"
                      type="text"
                      category="name"
                      defaultValue={() => this.getValue()}
                      group={this.state.personType}
                      empresa={this.props.empresa}
                      db={this.props.parent.props.db}
                      ref={this.setChildRef}
                    />
                    <DbInput
                      onChange={(slug, obj) => this.insertField(slug, obj)}
                      matchWith={['rfc']}
                      validate={['rfc']}
                      name="RFC"
                      type="text"
                      description='Clave que otorga el Servicio de Administración Tributaria (SAT)'
                      errorType="warning"
                      category="rfc"
                      group={this.state.personType}
                      db={this.props.parent.props.db}
                      empresa={this.props.empresa}
                      ref={this.setChildRef}
                    />
                    <DbInput
                      onChange={(slug, obj) => this.insertField(slug, obj)}
                      matchWith={['address']}
                      name="Dirección"
                      type="text"
                      db={this.props.parent.props.db}
                      group={this.state.personType}
                      empresa={this.props.empresa}
                      ref={this.setChildRef}
                    />
                    {
                      this.state.personType == 'accionista' ?
                      <DbInput
                        onChange={(slug, obj) => this.insertField(slug, obj)}
                        sumWith={['inner_capital_aportado']}
                        name="Capital aportado"
                        type="currency"
                        description='Cantidad de dinero que aportó el/la accionista.'
                        db={this.props.parent.props.db}
                        group={this.state.personType}
                        empresa={this.props.empresa}
                        ref={this.setChildRef}
                      />
                      : null
                    }

                    <div className="db_empresa_container_group_radios">
                      <div className="db_empresa_container_group_radios_title">
                        ¿Fue funcionarix?
                      </div>
                      <div className="db_empresa_container_group_radios_radio">
                        <input checked={funcionario} onChange={() => this.setState({funcionario: true, res: true})} type="radio" name="ss_c_e_t" />
                          <div className="db_empresa_container_group_radios_radio_c">
                            Sí
                          </div>
                      </div>
                      <div className="db_empresa_container_group_radios_radio">
                        <input checked={!funcionario} onChange={() => this.setState({funcionario: false, res: true})} type="radio" name="ss_c_e_t" />
                          <div className="db_empresa_container_group_radios_radio_c">
                            No
                          </div>
                      </div>
                    </div>

                    {
                      funcionario ?
                      <>
                      <DbInput
                        onChange={(slug, obj) => this.insertField(slug, obj)}
                        matchWith={['instancia']}
                        name="Nombre de la dependencia"
                        type="text"
                        description='Nombre de la dependencia donde fue o es funcionarix.'
                        group={this.state.personType}
                        empresa={this.props.empresa}
                        db={this.props.parent.props.db}
                        ref={this.setChildRef}
                      />
                      <DbInput
                        onChange={(slug, obj) => this.insertField(slug, obj)}
                        name="Último año activx"
                        type="text"
                        group={this.state.personType}
                        empresa={this.props.empresa}
                        db={this.props.parent.props.db}
                        ref={this.setChildRef}
                      />
                    </>

                    : null

                    }

                  </>
              : null}



            </div>
          </DialogContent>
          <DialogActions>
            <Button color="secondary" onClick={() => this.close()}>
              Cancelar
            </Button>
            <Button  color="secondary" onClick={() => this.add()}>
              {addL}
            </Button>
          </DialogActions>
        </Dialog>
      </ExpansionPanel>
    )
  }
}

class PersonRow extends React.Component{
  state = {
    showDelete: false
  }
  edit(){
    try{
      var t = this.props.p[0];
      var guid = t.guid || t.groupUid;
      this.props.onClick(guid);
    }catch{
      console.warn('Sin elementos');
    }

  }

  getName(){
    var x = this.props.i;
    var t = this.props.p[0].group;
    var f = this.props.p;
    var n = "";

    f.map(function(em){
      var cat = em.category;
      if(cat == "name"){
        n = em.value;
      }
      if(cat == "rfc" && !n){
        n = em.value;
      }
    })
    if(!n){
      n = t + ' #'+x;
    }
    return n;
  }


  delete(){
    var g = this.props.p;
    var t = g[0];
    var euid = t.empresauid;
    var dbid = t.fromdb;
    var guid = t.groupUid;
    window.dbf.deleteGroup(guid, euid, dbid);
  }

  render(){
    var n = this.getName();
    return(
      <>
      <div className="ss_transaction_row">
        <div className="ss_transaction_row_c">
          <div className="ss_transaction_row_n">
            {n}
          </div>
        </div>
        <div className="ss_transaction_row_d" onClick={() => this.edit()}>
          <Icon size="small">edit</Icon>
        </div>
        <div className="ss_transaction_row_d" onClick={() => this.setState({ showDelete: true})}>
          <Icon size="small">delete</Icon>
        </div>
      </div>
      <Dialog open={this.state.showDelete} onClose={() => this.setState({showDelete: false})}>
        <DialogTitle id="form-dialog-title">¿Borrar?</DialogTitle>
          <DialogContent>
            Esta acción es irreversible.
          </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={() => this.setState({showDelete: false})}>
            Cerrar
          </Button>
          <Button color="secondary" onClick={() => this.delete()}>
            Borrar permanentemente
          </Button>
        </DialogActions>
      </Dialog>
      </>
    )
  }
}
