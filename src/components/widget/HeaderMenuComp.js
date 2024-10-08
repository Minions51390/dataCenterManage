import React from 'react';
import 'antd/dist/antd.css';
import { Menu, Input, message } from 'antd';
import screenfull from 'screenfull';
import avater from '../../style/imgs/b1.png';
import useri from '../../style/imgs/useri.png';
import phonepng from '../../style/imgs/phone.png';
import { get, post, baseUrl } from '../../service/tools';
import { ArrowsAltOutlined, CommentOutlined } from '@ant-design/icons';
import PwaInstaller from './PwaInstaller';
import '../../style/pageStyle/HeaderMenuComp.less';

const { SubMenu } = Menu;
const phoneReg = /^[1][1,2,3,4,5,7,8,9][0-9]{9}$/;
const emailReg = new RegExp(
    '^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$'
);
class HeaderMenuComp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showOver: false,
            realName: this.props.realName,
            userName: this.props.userName,
            phone: this.props.phone,
            email: this.props.email,
        };
    }
    screenFull = () => {
        if (screenfull.isEnabled) {
            screenfull.toggle();
        }
    };
    menuClick = (e) => {
        e.key === 'logout' && this.logOut();
        e.key === 'userinfo' && this.showOverPop();
    };
    onMenuOpenChange = (e) => {
        console.log('lsflsflsf sub', e);
        this.openMenu(e);
    };
    openMenu = (v) => {
        console.log(v);
    };
    showOverPop = () => {
        this.setState({
            showOver: true,
        });
    };
    onInputRealName(event) {
        this.setState({
            realName: event.target.value,
        });
    }

    //电话号码
    onInputTele(event) {
        this.setState({
            phone: event.target.value,
        });
    }

    onInputEmail(event) {
        this.setState({
            email: event.target.value,
        });
    }

    handleModeChange(showOver, e) {
        console.log('showOver,', showOver);
        e.stopPropagation();
        this.setState({ showOver });
    }
    //退出登录
    async logOut() {
        let res = await get({ url: baseUrl + `/api/v1/auth/logout` });
        window.location.href = `${baseUrl}/#/home`;
    }

    rowLength(val) {
        return val.length >= 254 ? true : false;
    }

    componentDidMount() {
        console.log(80808080, this.props.email, this.props.phone);
    }
    componentDidUpdate(prevProps) {
        if (prevProps.realName !== this.props.realName) {
            this.setState({
                realName: this.props.realName,
                userName: this.props.userName,
                phone: this.props.phone,
                email: this.props.email,
            });
        }
    }
    // 提交信息
    async saveMes() {
        const { realName, phone, email } = this.state;
        // 真名检验
        if (!realName || this.rowLength(realName)) {
            message.error('真实姓名不能为空！');
            return;
        }
        // 手机号检验
        if (!phoneReg.test(phone) || this.rowLength(phone)) {
            message.error('手机号格式错误！');
            return;
        }
        // 邮箱检验
        if (!emailReg.test(email)) {
            message.error('邮箱格式不正确！');
            return;
        }
        let res = await post({
            url: baseUrl + '/api/v1/profile/teacher',
            data: {
                realName: realName,
                phone: phone,
                email: email,
            },
        });
        if (res.state == 101) {
            message.error(res.msg);
            return;
        } else if (res.state !== 0) {
            message.error('服务器开小差了');
            return;
        }
        message.success('设置成功!');
        this.setState({
            showOver: false,
            realName: realName,
        });
    }
    render() {
        const { showOver, phone, realName, userName, email } = this.state;
        return (
            <div>
                <Menu
                    mode="horizontal"
                    style={{ lineHeight: '64px', float: 'right' }}
                    onClick={this.menuClick}
                    onOpenChange={this.onMenuOpenChange}
                >
                    <Menu.Item key="full">
                        <ArrowsAltOutlined onClick={this.screenFull} />
                    </Menu.Item>
                    <SubMenu
                        style={{ marginRight: '164px' }}
                        title={
                            <span className="avatar">
                                <img src={avater} alt="头像" />
                                <i className="on bottom b-white" />
                                {` 你好 - ${realName != null ? realName : userName}`}
                            </span>
                        }
                    >
                        <Menu.ItemGroup title="用户中心">
                            <Menu.Item key="userinfo">个人信息</Menu.Item>
                            <Menu.Item key="logout">退出登录</Menu.Item>
                        </Menu.ItemGroup>
                    </SubMenu>
                </Menu>
                {showOver ? (
                    <div className="user-bg" onClick={this.handleModeChange.bind(this, false)}>
                        <div
                            className="user-area-top"
                            onClick={this.handleModeChange.bind(this, true)}
                        >
                            <div className="title">个人信息</div>
                            <div className="main-row">
                                <div className="form-area">
                                    <Input
                                        className="pass-mar"
                                        size="large"
                                        placeholder="请输入真实姓名"
                                        prefix={
                                            <div className="my-icon">
                                                <img className="input-icon" src={useri} />
                                            </div>
                                        }
                                        onChange={this.onInputRealName.bind(this)}
                                        value={realName}
                                    />
                                    <Input
                                        className="pass-mar  phone-icon"
                                        size="large"
                                        placeholder="请输入手机号"
                                        prefix={
                                            <div className="my-icon">
                                                <img className="input-icon" src={phonepng} />
                                            </div>
                                        }
                                        onChange={this.onInputTele.bind(this)}
                                        value={phone}
                                    />
                                    <Input
                                        className="pass-mar  phone-icon"
                                        disabled
                                        size="large"
                                        placeholder="请输入邮箱"
                                        prefix={
                                            <div className="my-icon">
                                                <CommentOutlined />
                                            </div>
                                        }
                                        onChange={this.onInputEmail.bind(this)}
                                        value={email}
                                    />
                                </div>
                            </div>
                            <div className="save-btn" onClick={this.saveMes.bind(this)}>
                                保存信息
                            </div>
                            <div className="log-out" onClick={this.logOut.bind(this)}>
                                退出登录
                            </div>
                        </div>
                    </div>
                ) : (
                    <div />
                )}
            </div>
        );
    }
}

export default HeaderMenuComp;
//  ReactDOM.render(<HeaderMenuComp />, document.getElementById('container'));
