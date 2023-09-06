import PlImport from './src/index.vue';

PlImport.install = Vue => {
  Vue.component(PlImport.name, PlImport);
};

export default PlImport;
