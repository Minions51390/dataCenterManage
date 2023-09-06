import PlDialog from './src/index.vue';

PlDialog.install = Vue => {
  Vue.component(PlDialog.name, PlDialog);
};

export default PlDialog;
