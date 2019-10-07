import React from 'react';
import * as d3 from "d3";
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import Tooltip from 'tooltip.js';
import Paper from '@material-ui/core/Paper';
import formatMoney from 'format-money';
import Switch from '@material-ui/core/Switch';
import CountTo from 'react-count-to';
import { _t } from '../../vars/countriesDict';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as ChartTooltip,
  ScatterChart,
  CartesianGrid,
  Scatter,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ZAxis,
  ResponsiveContainer
} from 'recharts';
var slugify = require('slugify');
var startLoad = new Event('sinapsisStartLoad');
var endLoad = new Event('sinapsisEndLoad');



export default class DbViz extends React.Component{
  state = {
    showSearch: true,
    showcontrols: true,
    displayAnalytics: false
  }
  constructor(props){
    super(props);
    this.nodesRef = React.createRef();
  }

  toggleAnalytics(){
    this.setState({
      displayAnalytics: !this.state.displayAnalytics
    })
  }

  toggleControls(){
    this.setState({
      showcontrols: !this.state.showcontrols
    })
  }

  render(){
    return(
      <>
      <div className="db_viz">
        <Nodes ref={(ref) => this.nodes = ref}/>
        <div className="nodes_controls">
          <div className="nodes_controls_button" onClick={() => this.toggleControls()}>
            <Icon>{this.state.showcontrols ? 'expand_more' : 'expand_less'}</Icon><div>{this.state.showcontrols ? 'Ocultar' : 'Mostrar'} controles</div>
          </div>
          <div style={{display: this.state.showcontrols ? 'block' : 'none'}}>
            <SSCategoryToggle nodesMap={this.nodes} />
            <SSNodeSize nodesMap={this.nodes}/>
            <SSNodeCoincidencias nodesMap={this.nodes} />
            <SSNodeFilter nodesMap={this.nodes}/>
          </div>
        </div>
          <AnalyticsButton onClick={() => this.toggleAnalytics()}/>
          {
            this.state.displayAnalytics ?
            <Analytics onClose={() => this.toggleAnalytics()} coincidencias={this.nodes.state.coincidencias}/>
            : null
          }
      </div>
      <Search nodesMap={this.nodes}/>
      </>
    )
  }
}

function getTypeColor(t){
  switch(t){
    case "empresa":
      return "#DBDBDB";
    break;
    case "rfc":
      return "#FF000A";
    break;
    case "date":
      return "#FF00A8";
    break;
    case "website":
      return "#FFFF00";
    break;
    case "person":
      return "#FF0054";
    break;
    case "titular":
      return "#FF0054";
    break;
    case "email":
      return "#A8FF00";
    break;
    case "convenio":
      return "#02FC8F";
    break;
    case "instancia":
      return "#555";
    break;
    case "contrato":
      return "#885BFA"
    break;
    case "no_notaria":
      return "rgb(182, 51, 194)";
    break;
    case "address":
      return "#FFFF99";
    break;
    default:
      return "#888888";
    break;
  }
}

function getTypeName(t){
  var o = false;
  switch(t){
    case "empresa":
       o = "Empresa";
    break;
    case "rfc":
      o =  "RFC";
    break;
    case "website":
      o =  "Sitio web";
    break;
    case "person":
      o =  "Persona";
    break;
    case "date":
      o =  "Fecha";
    break;
    case "email":
      o = "Correo electrónico";
    break;
    case "convenio":
      o =  "Convenio / Contrato";
    break;
    case "instancia":
      o =  "Instancia / Dependencia";
    break;
    case "titular":
      o =  "Titular de instancia";
    break;
    case "no_notaria":
      o =  "No. notaría";
    break;
    case "contrato":
      o =  "Convenio / Contrato";
    break;
    case "address":
      o = "Dirección";
    break;
    default:
      o = false;
    break;
  }
  return _t(o);
}


class AnalyticsButton extends React.Component{
  render(){
    return(
      <div id="ss_analytics_trigger" onClick={() => this.props.onClick()}>
        <div id="ss_analytics_trigger_arrow">
          <Icon>bar_chart</Icon>
        </div>
      </div>
    )
  }
}

class Analytics extends React.Component{

  sumTransferencias(){
    var i = 0;
    d3.selectAll('.node_circle')
      .each(function(n){
        if(n.type == "empresa"){
          if(n.fields.length > 0){
            var f = n.fields[0];
            var euid = f.empresauid;
            var dbuid = f.fromdb;
            var fields = window.dbf.getEmpresaFields(dbuid, euid);
            var t = window.dbf.getEmpresaTransferenciaSum(fields);
            if(t > 0){
              i += t;
            }
          }
        }
      })
    // console.log('t', i);
    return i;
  }


  buildFirstGraphs(a){
    var o = [];
    var c = a.count;
    var info = {
      "rfc": "RFC",
      "folio-mercantil": "folio mercantil",
      "direccion-fiscal": "dirección",
      "telefono": "teléfono",
      "sitio-web": "sitio web",
      "correo-electronico": "correo electrónico",
      "representante": "representante legal",
      "accionista": "accionista"
    };

    for(var key in info){
      var name = info[key];
      var data = {};
      data.name = name;
      data.key = key;
      data.chartData = [];
      data.val = a[key];

      /* Área positiva */
      var pos = {
        name: name,
        value: data.val
      };
      data.chartData.push(pos);

      /* Área negativa */
      var pos = {
        name: name,
        value: c - data.val
      };

      data.pct = Math.round((data.val / c) * 100);

      data.chartData.push(pos);
      o.push(data);
    }
    return o;
  }

  getScatterData(){
    var data = [];
    d3.selectAll('.node_circle')
      .each(function(d){
        if(d.sum){
          data.push(d);
        }
      });
    data.sort(function(a, b){
      if(a.sum < b.sum){
        return 1;
      }
      if(a.sum > b.sum){
        return -1;
      }
      return 0;
    })

    data = data.slice(0, 7);

    var o = [];

    data.map(function(d){
      var _o = {
        value: d.sum,
        index: 1,
        name: d.name
      };
      o.push(_o);
    })
    // console.log('o', o);
    return o;
  }

  kFormatter(num, digits) {
      var si = [
      { value: 1, symbol: "" },
      { value: 1E3, symbol: "k" },
      { value: 1E6, symbol: "M" },
      { value: 1E9, symbol: "G" },
      { value: 1E12, symbol: "T" },
      { value: 1E15, symbol: "P" },
      { value: 1E18, symbol: "E" }
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
      if (num >= si[i].value) {
        break;
      }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
  }

  render(){
    var self = this;
    var sumaConvenio = window.dbf.getGroupsSum("convenio", "convenio-numero-de-convenio", "convenio-monto-del-convenio");
    var sumaContrato = window.dbf.getGroupsSum("contrato", "contrato-numero-de-contrato", "contrato-monto-del-contrato");
    var sumaTransferencias = this.sumTransferencias();
    var buildAnalytics = window.dbf.buildAnalytics();
    var firstChartsGroup = this.buildFirstGraphs(buildAnalytics);
    var scatterData = this.getScatterData();

    var scatterDomain = [0, scatterData[0].value];

    return(
      <div className="ss_analytics">
        <div className="ss_analytics_close" onClick={() => this.props.onClose()}><Icon>close</Icon></div>
        <div className="ss_analytics_container">
          <div className="ss_analytics_container_group">
            <div className="ss_analytics_container_group_h1"><strong>{buildAnalytics.count}</strong> empresas con <strong>{this.props.coincidencias}</strong> coincidencias</div>
            <div className="ss_analytics_container_group_charts_group">
              {
                firstChartsGroup.map(function(data){
                  return(
                    <div className="ss_analytics_chart_binder">
                      <div className="ss_analytics_chart">
                        <PieChart width={100} height={100}>
                          <Pie dataKey="value" isAnimationActive={true} data={data.chartData} innerRadius={20} fill="#8884d8">
                            {
                              data.chartData.map((entry, index) => <Cell key={`cell-${index}`} strokeWidth={0} fill={!index ? '#025AFA' : '#333'} />)
                            }
                          </Pie>
                        </PieChart>
                      </div>
                      <div className="ss_analytics_chart_binder_info">
                        El <strong>{data.pct}%</strong> sí tiene <strong>{data.name}</strong>
                       <br/>
                       <span>({data.val} de {buildAnalytics.count})</span>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div>
          <div className="ss_analytics_container_group">
            <div className="ss_analytics_container_group_h1">Montos</div>
            <div className="ss_analytics_container_group_montos">
              <div className="ss_analytics_container_group_montos_group">
                <div className="ss_analytics_container_group_montos_group_m">
                  <CountTo to={sumaConvenio} speed={1000}>{value => formatMoney(value)}</CountTo>
                </div>
                <div className="ss_analytics_container_group_montos_group_l">
                  En <strong>convenios</strong>
                </div>
              </div>
              <div className="ss_analytics_container_group_montos_group">
                <div className="ss_analytics_container_group_montos_group_m">
                  <CountTo to={sumaContrato} speed={1000}>{value => formatMoney(value)}</CountTo>
                </div>
                <div className="ss_analytics_container_group_montos_group_l">
                  En <strong>contratos</strong>
                </div>
              </div>
              <div className="ss_analytics_container_group_montos_group">
                <div className="ss_analytics_container_group_montos_group_m">
                  <CountTo to={sumaTransferencias} speed={1000}>{value => formatMoney(value)}</CountTo>
                </div>
                <div className="ss_analytics_container_group_montos_group_l">
                  En <strong>transferencias</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="ss_analytics_container_group">
            <div className="ss_analytics_container_group_h1">Mayores montos</div>
            <div className="ss_analytics_container_group_scatter">
              <ResponsiveContainer>
                <BarChart
                  data={scatterData}
                >
                  <XAxis dataKey="name"  hide={true}/>
                  <YAxis name="Monto" tickFormatter={function(e){
                      return '$' + self.kFormatter(e);
                    }}/>
                  <ChartTooltip
                    formatter={function(value, name, props){
                      return [
                        formatMoney(value),
                        name
                      ]
                    }}
                  />
                <Bar dataKey="value" name="Monto neto recibido" fill="#5a53e3" />
                </BarChart>
              </ResponsiveContainer>
            </div>
        </div>
        </div>
      </div>
    )
  }
}


export class Search extends React.Component{
  state = {
    results: [],
    v: '',
    showResults: true
  }

  searchResults(v){
    this.setState({
      v: v,
      showResults: true
    })
    var f = [];

    if(v){
      var sv = slugify(v, {lower: true});

      d3.selectAll('.node')
        .each(function(n){
          var ns = slugify(n.name, {lower: true});
          var add = false;
          if(ns.length > sv.length){
            add = ns.indexOf(sv) > -1;
          }else{
            add = sv.indexOf(ns) > -1;
          }
          if(add && ns.length > 1){
            f.push(n);
          }
        })
    }

    this.setState({
      results: f
    })

  }


  handleResultSelect(v){
    this.setState({
      v: v,
      showResults: false
    })
  }

  render(){
    return(
      <div className="db_search_nodes">
        <div className="db_search_nodes_input">
          <input
            onFocus={() => this.searchResults(this.state.v)}
            value={this.state.v}
            placeholder="Busca por término"
            type="text"
            onChange={(e) => this.searchResults(e.target.value) }
            />
        </div>
        <div className="db_search_nodes_results">
          {
            this.state.showResults ?
            <SearchResults nodeMap={this.props.nodesMap} results={this.state.results} v={this.state.v} onSelect={(v) => this.handleResultSelect(v)}/>
            : null
          }
        </div>
      </div>
    )
  }
}

class SearchResults extends React.Component{
  isolateNode(id, n){
    if(this.props.nodeMap){
      this.props.nodeMap.isolateNode(id);
      this.props.nodeMap.setInitialZoom();
      this.props.onSelect(n);
    }
  }

  render(){
    var self = this;

    var r = this.props.results;

    var s = "";

    if(r.length){
      s = r.length + ' resultado' + (r.length > 1 ? 's' : '') ;
    }else{
      s = "Sin resultados";
    }


    return(
      <div className="db_search_nodes_results_c">
        {
          r.length ?
        <div className="db_search_nodes_results_c_r">
          {r.map(function(result){
            return(
              <div className="ss_search_result" onClick={(e) => self.isolateNode(result.id, result.name)}>
                <div className="ss_search_result_container">
                  <div className="ss_search_result_name">
                    {result.name}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        : null}

        {
          this.props.v.length ?
          <div className="db_search_nodes_results_c_count">
            {s}
          </div>
          : null
        }
      </div>
    )
  }

}

class Nodes extends React.Component{
  state = {
    hasloaded: false,
    loading: false,
    isPerfectZoom: true,
    coincidencias: 0,
    nodeSizeParam: 'monto',
    showall: false,
    onlyinall: false,
    displayDoi: true,
    initLoaded: false
  }
  componentDidMount(){
    var self = this;
    self.set();
    window.addEventListener('sinapsisBigModified', function(){
      d3.selectAll('#db_viz_nodes_canvas *').remove();
      self.set();
    })
    window.addEventListener('sinapsisDrawerToggle', function(){
      setTimeout(function(){
        self.resize();
      }, 300);
    })
  }
  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  resize(){
    try{
      var container = this.container;
      const width = container.offsetWidth,
            height = container.offsetHeight;
      this.canvas.attr('width', width)
                 .attr('height', height);
      this.setInitialZoom();
    }catch(ex){

    }

  }

  async set(){
    try{
      if(this.state.initLoaded){
        window.dispatchEvent(startLoad);
      }
      d3.selectAll('#db_viz_nodes_canvas *').remove();
      this.setState({
        loading: true
      })
      var self = this;
      var container = this.container;
      var onlyinall = this.state.onlyinall;
      var nodesData = window.dbf.getMatches(onlyinall);
      this.nodesData = nodesData;
      var _links = this.buildLinks();
      nodesData.links = _links;
      this.nodesData = nodesData;

      var nodesData = this.filterInitNodes();
      this.nodesData = nodesData;


      const width = container.offsetWidth,
            height = container.offsetHeight;
      var canvas = d3.select("#db_viz_nodes_canvas")
                     .attr('width', width)
                     .attr('height', height);
      this.canvas = canvas;


    var bgs = canvas.append('rect')
            .attr('class', 'nodes_container_bg')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'transparent')


      var simulation = d3.forceSimulation()
                         .force("charge", d3.forceManyBody(0.5))
                         .force("link",
                            d3.forceLink()
                              .id(function(d){
                                return d.id;
                              })
                          )
                         .force('collide', d3.forceCollide(700).strength(0.2))
                         .force('center', d3.forceCenter(width / 2, height / 2))
                         .force("y", d3.forceY(0.01))
                         .force("x", d3.forceX(0.01).x(1.1));

     this.simulation = simulation;
     this.nodesContainer = canvas.append('g').attr('class', 'nodes_container');





     var zoom = d3.zoom()
                  .extent([[0, 0], [width, height]])
                  .scaleExtent([-3, 8])
                  .on("zoom", function(z){
                     var d = d3.event.transform;
                     self.setState({
                       isPerfectZoom: false
                     })
                     canvas.select('.nodes_container').attr('transform', d);
                   });
     this.zoom = zoom;
     canvas.call(zoom)



     simulation.nodes(nodesData.nodes)
               .on('tick', this.drawNodes)
               .on('end', function(){

               })



     simulation.force('link')
               .links(nodesData.links);


      var data = this.nodesData;
      var circlesData = [];
      var labelsData = [];

      data.nodes.map(function(d){
        var t = d.type;
        var labelTypes = ['dependencia', 'instancia', 'titular'];
        if(labelTypes.indexOf(t) > -1){
          labelsData.push(d);
        }else{
          circlesData.push(d);
        }
      })

      var lMin = 8;
      var lMax = 50;

      var lRange=[0, 1700];

      var lMaxSize = Math.min(lRange[1], data.links.length);

      var lPct = Math.abs(1 - (lMaxSize / lRange[1]));
      console.log('lpct', lPct);

      var lSize = (lMax * lPct) + lMin;

      console.log('LSIZE', lSize);


      var links = self.nodesContainer
                     .selectAll('line')
                     .data(data.links)
                     .enter()
                     .append('line')
                     .attr('stroke-width', lSize)
                     .attr('class', 'nodes_link')
                     .attr('data-from', l => l.source.id)
                     .attr('data-to', l => l.target.id)
                     .attr('stroke', 'rgba(90, 67, 231, 0.8)');
      this.links = links;

      bgs.on('click', function(){
              self.releaseNode();
              self.simulation.stop();
            })

      this.getCoincidenciasSize();


      var nodesLabels = self.nodesContainer
                            .selectAll('.nodes_label')
                            .data(labelsData)
                            .enter(labelsData)
                            .append('g')
                            .attr('class', 'nodes_label node')
                            .attr('data-id', d => d.id)
                            .call(this.drag())

      var rects = nodesLabels
                   .append('rect')
                   .attr('fill', function(d){
                     return getTypeColor(d.type)
                   })

      nodesLabels.append('text')
                 .text((d) => d.name.toUpperCase())
                 .attr('fill', 'white')
                 .attr('font-size', 300)
                 .attr('text-anchor', 'middle')

      var nodesPaddingLeft = 60;
      var nodesPaddingTop = 35;

      nodesLabels.each(function(d){
        var g = d3.select(this);

        var bb = null;
        var t = g.selectAll('text')
                  .each(function(){
                    bb = this.getBBox();
                  })

        if(bb){
          var w = bb.width;
          var h = bb.height;

          var ww = w + (nodesPaddingLeft * 2);
          var hh = h + (nodesPaddingTop * 2);

          g.selectAll('rect')
           .attr('width', ww)
           .attr('height', hh)
           .attr('x', -ww / 2)
           .attr('y', -h + nodesPaddingTop)


        }

      })

      var nodesCircles = self.nodesContainer
                        .selectAll('circle')
                        .data(circlesData)
                        .enter()
                        .append('circle')
                        .attr('class', 'node node_circle')
                        .attr('data-name', (d) => d.name)
                        .attr('data-id', d => d.id)
                        .attr('data-type', d => d.type)
                        .attr('data-sum', function(d){
                          var t = d.type;
                          if(t == "empresa"){
                            var s = d.sum ? d.sum : 0;
                            return s;
                          }else{
                            return "notvalid";
                          }
                        })
                        .attr('id', (d, i) => 'node_'+i)
                        .attr('stroke', '#0a0a0a')
                        .attr('stroke-width', '4px')
                        .attr('data-type', (d) => d.type)
                        .attr('fill', function(d){
                          var t = d.type;
                          return getTypeColor(t);
                        })
                        .call(this.drag())



      this.nodesLabels = nodesLabels;
      this.nodesCircles = nodesCircles;

      this.setInitialZoom();

      d3.selectAll('.node')
        .attr('data-coincidencias', function(d){
          var c = self.getCoincidenciasById(d.id);
          d.coincidencias = c;
          return c;
        })
        .on('dblclick', function(d){
          self.releaseNode();
        })
        .on('mouseover', function(d, e){
          if(!d.blockShow){
            self.setState({
              doi: d,
              displayTooltip: true
            })
          }

        })
        .on('click', function(d){
          d.isclicked = true;
          self.isolateNode(d.id)
        })
        .on('mouseleave', function(d){
          self.nodesContainer.selectAll('.viz_tooltip').remove();
          self.setState({
            doi: null,
            displayTooltip: false
          })
        })

        this.setNodeCircleSize();


      setTimeout(function(){
        self.setState({
          loading: false,
          initLoaded: true
        })
        window.dispatchEvent(endLoad);
      }, 2500);
    }catch(ex){

    }
  }

  changeCircleSize(type){
    var self = this;
    this.setState({
      nodeSizeParam: type
    })
    setTimeout(function(){
      self.setNodeCircleSize();
    }, 50);
  }

  getCoincidenciasSize(){
    var x = 0;
    d3.selectAll('.nodes_link')
      .each(function(l){
        if(!l.blockShow){
          x++;
        }
      })

    this.setState({
      coincidencias: x
    })

    return x;

  }

  filterInitNodes(){
    var n = this.nodesData.nodes;
    var l = this.nodesData.links;



    var uidWithConnections = [];

    l.map(function(_l){
      var a = _l.source;
      if(uidWithConnections.indexOf(a) == -1){
        uidWithConnections.push(a);
      }
      var a = _l.target;
      if(uidWithConnections.indexOf(a) == -1){
        uidWithConnections.push(a);
      }
    })

    /* Muestra sólo con conexiones */
    if(!this.state.showall){
      // console.log('HOLA');
      n = n.filter(function(_n){
        return uidWithConnections.indexOf(_n.id) > -1;
      })
    }


    var nd = {
      nodes: n,
      links: l
    }
    return nd;
  }

  setNodeCircleSize(){
    var min = 80;
    var max = this.nodesData.nodes.length > 500 ? 1250 : 600;
    var param = this.state.nodeSizeParam;
    if(param == "monto"){
      var empresaMinMax = this.getEmpresaMinMax();
      var compMax = empresaMinMax.max;
    }else if(param == "coincidencias"){
      /* Obtiene el maximo de coincidencias */
      var compMax = 0;
      d3.selectAll('.node_circle')
        .each(function(d){
          if(!d.blockShow){
            compMax = Math.max(d.coincidencias, compMax);
          }
        })
    }

    d3.selectAll('.node_circle')
      .transition()
      .duration(500)
      .attr('r', function(d){
        var v = 0;
        if(param == "monto"){
          if(d.type == "empresa"){
            var s = d.sum ? d.sum : 0;
            v = s;
          }
        }else if(param == "coincidencias"){
          v = d.coincidencias ? d.coincidencias : 0;
        }
        var base = ((v / compMax) * max) + min;

        if(param == "monto" && d.type == "empresa"){
          base += 10;
        }
        if(isNaN(base)){
          base = min;
        }

        base = Math.max(base, min);

        return base;
      })


  }

  buildLinks(){
    var n = this.nodesData.nodes;
    var ids = [];
    n.map(function(_n){
      ids.push(_n.id);
    })
    var links = [];

    n.map(function(d){
      var id = d.id;
      var f = d.fields;
      f.map(function(_f){
        if(id !== _f.id && ids.indexOf(_f.empresauid) > -1){
          links.push({
            source: id,
            target: _f.empresauid
          })
        }
      })
    })

    /* Unicidad */
    var js = {};
    links = links.filter(function(l){
      if(!js[l.source]){
        js[l.source] = [l.target];
        return true;
      }else{
        if(js[l.source].indexOf(l.target) > -1){
          return false;
        }else{
          js[l.source].push(l.target);
          return true;
        }
      }
    })





    return links;
  }

  getCoincidenciasById(id){
    var ls = this.nodesData.links.filter(function(l){
      return l.target.id == id || l.source.id == id;
    });
    return ls.length;
  }

  isolateNode(id){
    this.releaseNode();

    var self = this;

    this.nodesContainer
       .selectAll('.nodes_link:not([data-from="'+id+'"]):not([data-to="'+id+'"])')
       .attr('stroke', 'rgba(90, 67, 231, 0.1)');

    var ls = this.nodesData.links.filter(function(l){
      return l.target.id == id || l.source.id == id;
    });

    var nds_ids = [];

    ls.map(function(ld){
      nds_ids.push(ld.source.id)
      nds_ids.push(ld.target.id)
    });

    nds_ids.push(id);


    this.nodesContainer
        .selectAll('.node')
        .attr('opacity', 0.05)

    nds_ids.map(function(id){
      self.nodesContainer
          .selectAll('.node[data-id="'+id+'"]')
          .attr('opacity', 1)
    })

    var doi = null;
    doi = this.nodesData.nodes.filter(function(d){
      return d.id == id;
    })

    if(doi){
      doi = doi[0];
    }


    this.setState({
      isolatingNode: true,
      isoDoi: doi
    })
  }

  releaseNode(){
    this.nodesContainer.selectAll('.nodes_link').attr('stroke', 'rgba(90, 67, 231, 0.79)');
    this.nodesContainer.selectAll('.node').attr('opacity', d => !d.blockShow ? 1 : 0);
    this.setState({
      isolatingNode: false
    })
  }

  getEmpresaMinMax(){
    var d = this.nodesData;
    var min = 0;
    var max = 0;
    var n = d.nodes;
        n = Object.values(n);

    n.map(function(e){
      if(e.sum && e.type == 'empresa'){
        min = Math.min(e.sum, min);
        max = Math.max(e.sum, max);
      }
    })
    return {
      min: min,
      max: max
    }
  }

  drawNodes = e => {
    var self = this;
    var data = this.nodesData;
    /* Nodos */

    this.links
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)

    this.nodesCircles
        .attr('cx', (d) => d.fixed ? d.fx : d.x)
        .attr('cy', (d) => d.fixed ? d.fy : d.y)

    this.nodesLabels.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
          });


  }

  setInitialZoom(){
    var self = this;
    var container = this.container;
    const width = container.offsetWidth,
          height = container.offsetHeight;

    var box = this.nodesContainer.node().getBBox();

    var zoomIdentity = d3.zoomIdentity.translate(width / 2, height / 2).scale(0.02)
    this.nodesContainer.attr('transform', zoomIdentity);
    this.canvas.call(this.zoom.transform, zoomIdentity);

    this.setState({
      isPerfectZoom: true
    })

  }

  filterCategory(vals){
    if(vals.indexOf('empresa') == -1){
      vals.push('empresa');
    }

    var ids = [];

    d3.selectAll('.node')
      .each(function(d){
        var t = d.type;
        if(vals.indexOf(t) == -1){
          d.blockShow = true;
          d3.select(this).attr('opacity', 0);
          ids.push(d.id);
        }else{
          d3.select(this).attr('opacity', 1);
          d.blockShow = false;
        }
      })

    d3.selectAll('.nodes_link')
      .each(function(l){
        if(ids.indexOf(l.target.id) > -1 || ids.indexOf(l.source.id) > -1){
          l.blockShow = true;
          d3.select(this).attr('opacity', 0);
        }else{
          l.blockShow = false;
          d3.select(this).attr('opacity', 1);
        }
      })

    this.setNodeCircleSize();
    this.getCoincidenciasSize();
  }


  toggleEmpresas(showall){
    var self = this;
    this.setState({
      showall: showall
    })
    this.simulation.stop();
    setTimeout(function(){
      self.set();
    }, 100);
  }

  toggleOnlyAll(onlyinall){
    var self = this;
    this.setState({
      onlyinall: onlyinall
    })
    this.simulation.stop();
    setTimeout(function(){
      self.set();
    }, 100);
  }

  drag(){
    var simulation = this.simulation;
    var self = this;
    function dragstarted(d) {
       if (!d3.event.active) simulation.alphaTarget(0.1).restart();
       d.fx = d.x;
       d.fy = d.y;
     }

     function dragged(d) {
       d.fx = d3.event.x;
       d.fy = d3.event.y;
     }

     function dragended(d) {
       if (!d3.event.active) simulation.alphaTarget(0.1).restart();
       d.fixed = true;
       simulation.stop();
     }

   return d3.drag()
             .on("start", dragstarted)
             .on("drag", dragged)
             .on("end", dragended);
  }

  render(){
    return(
      <div className="db_viz_nodes" ref={(ref) => this.container = ref}>
        <div id="db_viz_nodes_controls">
          <Fab title="Refrescar" alt="Refrescar" size="small" color="primary" onClick={() => this.set()}>
            <Icon>autorenew</Icon>
          </Fab>
          {
            !this.state.isPerfectZoom ?
            <Fab title="Centrar" alt="Centrar" size="small" color="primary" disabled={this.state.isPerfectZoom} onClick={() => this.setInitialZoom()}>
              <Icon>center_focus_strong</Icon>
            </Fab>
            : null
          }
          {
            this.state.isolatingNode ?
            <Fab
              title="Mostrar todos los nodos"
              size="small"
              id="ss_fab_release"
              color="primary"
              disabled={!this.state.isolatingNode}
              onClick={() => this.releaseNode()}
            >
              <Icon>scatter_plot</Icon>
            </Fab>
            : null
          }

        </div>
        <div className="db_viz_info">
          {
            this.state.isolatingNode  ?
            <SSDoi doi={this.state.isoDoi} canvas={this.canvasSvg} display={this.displayDoi} onToggle={() => this.setState({displayDoi: !this.state.displayDoi})}/>
          : null
          }
          <div className="db_viz_info_coincidencias">
            <strong>{this.numberWithCommas(this.state.coincidencias)}</strong> coincidencia{this.state.coincidencias === 1 ? '' : 's'}
          </div>
        </div>

        <svg id="db_viz_nodes_canvas" ref={(ref) => this.canvasSvg = ref}></svg>
          {
            this.state.displayTooltip  ?
            <SSTooltip doi={this.state.doi} canvas={this.canvasSvg} />
            : null
          }
      </div>
    )
  }
}

class SSNodeSize extends React.Component{
  state = {
    type: 'monto',
    checked: false
  }

  handleChange(e){
    var t = this.state.checked;
    var nt = !t;
    this.setState({
      checked: nt
    })

    var type = !nt ? 'monto' : 'coincidencias';
    this.props.nodesMap.changeCircleSize(type);
  }

  render(){
    return(
      <div className="ss_control_node_size ss_control_group">
        <div className="ss_control_group_container">
          <div className="ss_control_group_container_title">
            Tamaño de círculos
          </div>
          <div className="ss_control_group_container_switch">
            <label>Por monto recibido</label>
            <Switch
              checked={this.state.checked}
              onChange={(e) => this.handleChange(e)}
              value="t"
              size="small"
              inputProps={{ 'aria-label': 'secondary checkbox' }}
            />
            <label>Por coincidencias</label>
          </div>
        </div>
      </div>
    )
  }
}

class SSNodeFilter extends React.Component{
  state = {
    type: 'monto',
    checked: false
  }

  handleChange(e){
    var t = this.state.checked;

    var nt = !t;
    this.setState({
      checked: nt
    })
    window.dispatchEvent(startLoad);
    this.props.nodesMap.toggleEmpresas(nt);
  }

  render(){
    return(
      <div className="ss_control_node_size ss_control_group">
        <div className="ss_control_group_container">
          <div className="ss_control_group_container_title">
            Mostrar empresas
          </div>
          <div className="ss_control_group_container_switch">
            <label>Solo con coincidencias</label>
            <Switch
              checked={this.state.checked}
              onChange={(e) => this.handleChange(e)}
              value="t"
              size="small"
              inputProps={{ 'aria-label': 'secondary checkbox' }}
            />
            <label>Todas</label>
          </div>
        </div>
      </div>
    )
  }
}

class SSNodeCoincidencias extends React.Component{
  state = {
    type: 'monto',
    checked: false
  }

  handleChange(e){
    var t = this.state.checked;
    var nt = !t;
    this.setState({
      checked: nt
    })
    this.props.nodesMap.toggleOnlyAll(nt);
  }

  render(){
    return(
      <div className="ss_control_node_size ss_control_group">
        <div className="ss_control_group_container">
          <div className="ss_control_group_container_title">
            Mostrar coincidencias
          </div>
          <div className="ss_control_group_container_switch">
            <label>Todas</label>
            <Switch
              checked={this.state.checked}
              onChange={(e) => this.handleChange(e)}
              value="t"
              size="small"
              inputProps={{ 'aria-label': 'secondary checkbox' }}
            />
          <label>Solo entre distintas bases</label>
          </div>
        </div>
      </div>
    )
  }
}

class SSCategoryToggle extends React.Component{
  state = {
    vals: [
      "rfc",
      "website",
      "person",
      "date",
      "email",
      "instancia",
      "contrato",
      "address",
      "no_notaria"
    ]
  }

  componentDidMount(){
    var self = this;
    window.addEventListener('sinapsis_lang_change', function(){
      self.setState({
        s: ''
      })
    })
  }


  handleChange(e, v){
    var vals = this.state.vals;
    var ischecked = e.target.checked;
    var exists = vals.indexOf(v) > -1;
    if(ischecked && !exists){
      vals.push(v);
    }
    if(!ischecked && exists){
      vals.splice(vals.indexOf(v), 1);
    }

    this.props.nodesMap.filterCategory(vals);

    this.setState({
      vals: vals
    })
  }

  render(){
    var self = this;
    var types = [
      "rfc",
      "website",
      "person",
      "date",
      "email",
      "instancia",
      "contrato",
      "address",
      "no_notaria"
    ];
    return(
      <div className="ss_control_node_filter ss_control_group">
        <div className="ss_control_group_container">
          <div className="ss_control_group_container_title">
            Filtrar
          </div>
          <div className="ss_control_group_container_switches">
            {
              types.map(function(m){
                return(
                  <div className="ss_ctr_ch">
                    <input
                      checked={self.state.vals.indexOf(m) > -1}
                      onChange={(e) => self.handleChange(e, e.target.value)}
                      type="checkbox"
                      name="ss_filter"
                      value={m}
                    />
                    <div className="ss_ctr_ch_tds">
                      <div className="ss_ctr_ch_td">
                        <div className="ss_ctr_ch_td_ball" style={{backgroundColor: getTypeColor(m)}}></div>
                      </div>
                      <div className="ss_ctr_ch_td">{getTypeName(m)}</div>
                    </div>

                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    )
  }
}

class SSDoi extends React.Component{
  render(){
    var d = this.props.doi;
    var tc = getTypeColor(d.type);
    var fields = d.fields;
    return(
      <div className="ss_doi_window">
        <div className="ss_doi_window_type" style={{color: tc, borderColor: tc}}>
          {getTypeName(d.type)}
        </div>
        <div className="ss_doi_window_name">
          {d.name}
        </div>
        <div className="ss_doi_window_fields">
          {
            fields.map(function(field){
              return <SSDoiField field={field} />
            })
          }
        </div>
        <div className="ss_doi_window_fields_info">
          Encontrado en {d.fields.length} {d.fields.length > 1 ? 'campos' : 'campo'}
        </div>
      </div>
    )
  }
}

class SSDoiField extends React.Component{

  onClick(){
    var euid = this.props.field.empresauid;
    var dbid = this.props.field.fromdb;
    if(euid && dbid){
      var data = {
        euid: euid,
        dbid: dbid
      }
      var event = new CustomEvent('sinapsisOpenEmpresa', { detail: data});
      var ev = new Event('sinapsisStartLoad');
      window.dispatchEvent(event);
      window.dispatchEvent(ev);
    }
  }

  render(){
    return(
      <div className="ss_doi_window_fields_field" onClick={() => this.onClick()}>
        {
          this.props.field.group ?
          <div className="ss_doi_window_fields_field_group">
            {this.props.field.group}
          </div>
          : null
        }

        <div className="ss_doi_window_fields_field_name">
          {this.props.field.name}
        </div>

        {
          this.props.field.empresauid && this.props.field.fromdb ?
          <div className="ss_doi_window_fields_field_dbinfo">
           <div>{window.dbf.getEmpresa(this.props.field.fromdb, this.props.field.empresauid).name}</div>
           <div><Icon>dns</Icon><div>{window.dbf.getDb(this.props.field.fromdb).name}</div> </div>
          </div>
          : null
        }

      </div>
    )
  }
}

class SSTooltip extends React.Component{
  render(){
    try{
      var coords = d3.mouse(this.props.canvas);
    }catch{
      var coords = [0, 0];
    }

    var d = this.props.doi;


    var node = d3.select('.node[data-id="'+d.id+'"]');
    return(
      <div
        className="db_viz_tooltip"
        style={{left: coords[0], top: coords[1], borderColor: getTypeColor(d.type) }}
      >
        <div className="db_viz_tooltip_type_name" style={{color: getTypeColor(d.type)}}>
          {getTypeName(d.type)}
        </div>
        <div className="db_viz_tooltip_name">
          {d.name}
        </div>
        <div className="db_viz_tooltip_links">
          Cantidad de coincidencias: {node.attr('data-coincidencias')}
        </div>

        {
          d.type == "empresa" ?
          <div className="db_viz_tooltip_monto">
            Monto neto que recibió la empresa: {formatMoney(d.fields[0].sum)}
          </div>
          : null
        }

        <div className="db_viz_tooltip_monto">
          Da click en el círculo para más información
        </div>


      </div>
    )
  }
}
