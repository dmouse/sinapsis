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
import Fab from '@material-ui/core/Fab';
import Icon from '@material-ui/core/Icon';
import DbInput from '../inputs';
import Tooltip from '@material-ui/core/Tooltip';
import { isMexico } from '../../../vars/countriesDict';


export default class DbFormGroupBanderasRojas extends React.Component{
  state = {
    open: false
  }
  componentDidMount(){
  }
  render(){
    return(
      <>
      <ExpansionPanel expanded={this.state.open} onChange={(e, ex) => this.setState({open: ex})}>
        <ExpansionPanelSummary expandIcon={<Icon>expand_more</Icon>}>
          <div className="dbef_n">
            <div className="dbef_n_n">
              Banderas Rojas
              {
                isMexico() ?
                <div className="dbef_n_tooltip">
                  <Tooltip
                    title="Puedes conseguir esta información desde SAT. Da clic para visitar el sitio"
                  >
                    <a href="http://omawww.sat.gob.mx/cifras_sat/Paginas/datos/vinculo.html?page=ListCompleta69B.html" target="_blank">
                      <Icon size="small">help</Icon>
                    </a>
                  </Tooltip>
                </div>
                : null
              }
            </div>
            <div className="dbef_n_ctas">
              {
                this.state.open ?
                <div className="dbef_n_ctas_c" onClick={() => this.setState({open: false})}>Guardar</div>
                : null
              }
            </div>
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <div className="db_empresa_container_group_form">
            <DbInput
              onChange={(slug, obj) => this.props.parent.insertField(slug, obj)}
              matchWith={['rfc']}
              validate={['rfc']}
              name="RFC"
              type="text"
              errorType="warning"
              errorLegend="Quizá debas eliminar guiones o puntos"
              empresa={this.props.empresa}
            />
          </div>
        </ExpansionPanelDetails>
        {this.props.children}
      </ExpansionPanel>
      </>
    )
  }
}

class BanderaRoja extends React.Component{

  render(){
    return(
      <div className="ss_db_br">
        <div className="ss_db_br_name"></div>
      </div>
    )
  }

}
