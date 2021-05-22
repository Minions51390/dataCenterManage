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
    phone?: any;
    realName?: any;
    userName?: any;
};

const HeaderCustom = (props: HeaderCustomProps) => {
    const [responsive] = useAlita('responsive', { light: true });
    // const [phone] = useAlita('phone');
    // const [realName] = useAlita('realName');
    // const [userName] = useAlita('userName');
    console.log("yangqi1", props, props.realName)
    const [visible, turn] = useSwitch();

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
                <HeaderMenuComp userName={props.userName} realName={props.realName} phone={props.phone}></HeaderMenuComp>
            </div>
            
            
        </Header>
    );
};

export default HeaderCustom;
