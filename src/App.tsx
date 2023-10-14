import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import umbrella from 'umbrella-storage';
import { useAlita } from 'redux-alita';
import Routes from './routes';
import SiderCustom from './components/SiderCustom';
import HeaderCustom from './components/HeaderCustom';
import { ThemePicker, Copyright } from './components/widget';
import { checkLogin } from './utils';
// import { fetchMenu } from './service';
import classNames from 'classnames';
import { get, baseUrl } from './service/tools';
import { message } from 'antd';
// import { SmileOutlined } from '@ant-design/icons';

const { Content, Footer } = Layout;

type AppProps = {};

function checkIsMobile() {
    const clientWidth = window.innerWidth;
    return clientWidth <= 992;
}

let _resizeThrottled = false;
function resizeListener(handler: (isMobile: boolean) => void) {
    const delay = 250;
    if (!_resizeThrottled) {
        _resizeThrottled = true;
        const timer = setTimeout(() => {
            handler(checkIsMobile());
            _resizeThrottled = false;
            clearTimeout(timer);
        }, delay);
    }
}
function handleResize(handler: (isMobile: boolean) => void) {
    window.addEventListener('resize', resizeListener.bind(null, handler));
}

/**
 * 获取服务端异步菜单
 * @param handler 执行回调
 */
// function fetchSmenu(handler: any) {
//     const setAlitaMenu = (menus: any) => {
//         handler(menus);
//         // this.props.setAlitaState({ stateName: 'smenus', data: menus });
//     };
//     setAlitaMenu(umbrella.getLocalStorage('smenus') || []);
//     fetchMenu().then((smenus) => {
//         setAlitaMenu(smenus);
//         umbrella.setLocalStorage('smenus', smenus);
//     });
// }


// 获取用户信息
async function getMes() {
    let res = await get({
        url: baseUrl + '/api/v1/profile/teacher',
    });

    console.log('yangqi liu2', res);
    if (!res && !res.state == null) {
        message.error('服务器开小差了')
        return
    }
    if (res.state == 401) {
        message.error('请登录后使用')
        window.location.href = `${baseUrl}/#/home`;
        return
    } else if (res.state == 403) {
        message.error('当前身份无法访问该页面，请登录教师账号')
        window.location.href = `${baseUrl}/#/home`;
        return
    }
    localStorage.setItem("classTeacherAccount", res.data.userName);
    localStorage.setItem("classTeacherId", res.data.teacherId);
    return res
}

const App = (props: AppProps) => {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const [auth, responsive, setAlita] = useAlita(
        { auth: { permissions: null } },
        { responsive: { isMobile: false } },
        { light: true }
    );
    const [phone, setPhone] = useState('');
    const [realName, setRealName] = useState('');
    const [userName, setUserName] = useState('');
    
    useEffect(() => {
        getMes().then((res) => {
            console.log('登陆', res.data);
            setPhone(res.data.phone)
            setRealName(res.data.realName)
            setUserName(res.data.userName)
        });
    }, [])

    useEffect(() => {
        let user = umbrella.getLocalStorage('user');
        user && setAlita('auth', user);
        setAlita('responsive', { isMobile: checkIsMobile() });

        handleResize((isMobile: boolean) => setAlita('responsive', { isMobile }));
        // 异步获取菜单
        // fetchSmenu((smenus: any[]) => setAlita('smenus', smenus));
    }, [setAlita]);

    function toggle() {
        setCollapsed(!collapsed);
    }
    
    return (
        <Layout>
            {!responsive.isMobile && (
                <SiderCustom collapsed={collapsed} />
            )}
            <ThemePicker />
            <Layout
                className={classNames('app_layout', { 'app_layout-mobile': responsive.isMobile })}
            >
                <HeaderCustom toggle={toggle} collapsed={collapsed} user={auth || {}} collapsible={false} realName={realName} userName={userName} phone={phone} />
                <Content className="app_layout_content">
                    <Routes auth={auth} />
                </Content>
                <Footer className="app_layout_foot">
                    <Copyright />
                </Footer>
            </Layout>
        </Layout>
    );
};

export default App;
