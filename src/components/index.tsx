import Loadable from 'react-loadable';
import Loading from './widget/Loading';
import BasicTable from './tables/BasicTables';
import AdvancedTable from './tables/AdvancedTables';
import AsynchronousTable from './tables/AsynchronousTable';
import Echarts from './charts/Echarts';
import Recharts from './charts/Recharts';
import Icons from './ui/Icons';
import Buttons from './ui/Buttons';
import Spins from './ui/Spins';
import Modals from './ui/Modals';
import Notifications from './ui/Notifications';
import Tabs from './ui/Tabs';
import Banners from './ui/banners';
import Drags from './ui/Draggable';
import Dashboard from './dashboard/Dashboard';
import QueBankCreate from './queBankCreate/QueBankCreate';
import BankDetail from './queBankCreate/BankDetail';
import QuestionAdd from "./queBankCreate/QuestionAdd";
import TestPaper from './testPaper/TestPaper';
import TestRank from './testRank/TestRank';
import StuRank from './testRank/stuRank';
import TestDetail from './testPaper/TestDetail';
import Ranks from './rank/Ranks';
import ErrorBook from './errorBook/ErrorBook'
import ClassStu from './classStu/ClassStu';
import MainClass from './classStu/MainClass';
import MainSet from './classStu/MainSet';
import Gallery from './ui/Gallery';
import BasicAnimations from './animation/BasicAnimations';
import ExampleAnimations from './animation/ExampleAnimations';
import AuthBasic from './auth/Basic';
import RouterEnter from './auth/RouterEnter';
import Cssmodule from './cssmodule';
import MapUi from './ui/map';
import QueryParams from './extension/QueryParams';
import Visitor from './extension/Visitor';
import MultipleMenu from './extension/MultipleMenu';
import Sub1 from './smenu/Sub1';
import Sub2 from './smenu/Sub2';
import Env from './env';
import MistakeRank from './testRank/MistakeRank';
import StuPaperDetail from './testPaper/StuPaperDetail';

const WysiwygBundle = Loadable({
    // 按需加载富文本配置
    loader: () => import('./ui/Wysiwyg'),
    loading: Loading,
});

export default {
    BasicTable,
    AdvancedTable,
    AsynchronousTable,
    Echarts,
    Recharts,
    Icons,
    Buttons,
    Spins,
    Modals,
    Notifications,
    Tabs,
    Banners,
    Drags,
    Dashboard,
    Ranks,
    ErrorBook,
    Gallery,
    BasicAnimations,
    ExampleAnimations,
    AuthBasic,
    RouterEnter,
    WysiwygBundle,
    Cssmodule,
    MapUi,
    ClassStu,
    MainClass,
    MainSet,
    QueBankCreate,
    BankDetail,
    QuestionAdd,
    TestPaper,
    TestRank,
    StuRank,
    TestDetail,
    QueryParams,
    Visitor,
    MultipleMenu,
    Sub1,
    Sub2,
    Env,
    MistakeRank,
    StuPaperDetail,
} as any;
