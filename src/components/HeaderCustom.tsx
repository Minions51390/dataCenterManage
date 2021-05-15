import React, { useEffect, useState } from 'react';
import SiderCustom from './SiderCustom';
import { Menu, Layout, Popover } from 'antd';
import { gitOauthToken, gitOauthInfo } from '../service';
import { parseQuery } from '../utils';
import { useHistory } from 'react-router-dom';
import { useAlita } from 'redux-alita';
import umbrella from 'umbrella-storage';
import { useSwitch } from '../utils/hooks';
import HeaderMenuComp from './widget/HeaderMenuComp';
import {
    BarsOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
const { Header } = Layout;

type HeaderCustomProps = {
    toggle: () => void;
    collapsed: boolean;
    user: any;
    responsive?: any;
    path?: string;
    collapsible?: boolean;
};

const HeaderCustom = (props: HeaderCustomProps) => {
    const [user, setUser] = useState<any>();
    
    const [responsive] = useAlita('responsive', { light: true });
    // const [collapsible] = useAlita('collapsible', true);
    const [visible, turn] = useSwitch();
    const history = useHistory();
    
    useEffect(() => {
        const query = parseQuery();
        let storageUser = umbrella.getLocalStorage('user');

        if (!storageUser && query.code) {
            gitOauthToken(query.code as string).then((res: any) => {
                gitOauthInfo(res.access_token).then((info: any) => {
                    setUser({
                        user: info,
                    });
                    umbrella.setLocalStorage('user', info);
                });
            });
        } else {
            setUser({
                user: storageUser,
            });
        }
    }, []);
    
    
    const logout = () => {
        umbrella.removeLocalStorage('user');
        history.push('/login');
    };
    return (
        <Header className="custom-theme header">
            {props.collapsible && <div>
                {responsive?.isMobile ? (
                    <Popover
                        content={<SiderCustom popoverHide={turn.turnOff} />}
                        trigger="click"
                        placement="bottomLeft"
                        visible={visible}
                        onVisibleChange={(visible) => (visible ? turn.turnOn() : turn.turnOff())}
                    >
                        <BarsOutlined className="header__trigger custom-trigger" />
                    </Popover>
                ) : props.collapsed ? (
                    <MenuUnfoldOutlined
                        className="header__trigger custom-trigger"
                        onClick={props.toggle}
                    />
                ) : (
                    <MenuFoldOutlined
                        className="header__trigger custom-trigger"
                        onClick={props.toggle}
                    />
                )}
                </div>
            }
            <div style={{ lineHeight: '64px', float: 'right' }}>
                <HeaderMenuComp user={user} logout={logout}></HeaderMenuComp>
            </div>
            
            
        </Header>
    );
};

export default HeaderCustom;
