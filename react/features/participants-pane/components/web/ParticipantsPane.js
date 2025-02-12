// @flow

import { withStyles } from '@material-ui/core';
import React, { Component } from 'react';

import participantsPaneTheme from '../../../base/components/themes/participantsPaneTheme.json';
import { openDialog } from '../../../base/dialog';
import { translate } from '../../../base/i18n';
import { Icon, IconClose, IconHorizontalPoints } from '../../../base/icons';
import { isLocalParticipantModerator } from '../../../base/participants/functions';
import { connect } from '../../../base/redux';
import Button from '../../../base/ui/components/web/Button';
import { BUTTON_TYPES } from '../../../base/ui/constants';
import { isAddBreakoutRoomButtonVisible } from '../../../breakout-rooms/functions';
import { MuteEveryoneDialog } from '../../../video-menu/components/';
import { close } from '../../actions';
import {
    findAncestorByClass,
    getParticipantsPaneOpen,
    isMoreActionsVisible,
    isMuteAllVisible
} from '../../functions';
import { AddBreakoutRoomButton } from '../breakout-rooms/components/web/AddBreakoutRoomButton';
import { RoomList } from '../breakout-rooms/components/web/RoomList';

import { FooterContextMenu } from './FooterContextMenu';
import LobbyParticipants from './LobbyParticipants';
import MeetingParticipants from './MeetingParticipants';

/**
 * The type of the React {@code Component} props of {@link ParticipantsPane}.
 */
type Props = {

    /**
     * Whether there is backend support for Breakout Rooms.
     */
    _isBreakoutRoomsSupported: Boolean,

    /**
     * Whether to display the context menu  as a drawer.
     */
    _overflowDrawer: boolean,

    /**
     * Is the participants pane open.
     */
    _paneOpen: boolean,

    /**
     * Should the add breakout room button be displayed?
     */
    _showAddRoomButton: boolean,

    /**
     * Whether to show the more actions button.
     */
    _showMoreActionsButton: boolean,

    /**
     * Whether to show the mute all button.
     */
    _showMuteAllButton: boolean,

    /**
     * Whether to show the footer menu.
     */
    _showFooter: boolean,

    /**
     * The Redux dispatch function.
     */
    dispatch: Function,

    /**
     * An object containing the CSS classes.
     */
    classes: Object,

    /**
     * The i18n translate function.
     */
    t: Function
};

/**
 * The type of the React {@code Component} state of {@link ParticipantsPane}.
 */
type State = {

    /**
     * Indicates if the footer context menu is open.
     */
    contextOpen: boolean,

    /**
     * Participants search string.
     */
    searchString: string
};

const styles = theme => {
    return {
        container: {
            boxSizing: 'border-box',
            flex: 1,
            overflowY: 'auto',
            position: 'relative',
            padding: `0 ${participantsPaneTheme.panePadding}px`,

            [`& > * + *:not(.${participantsPaneTheme.ignoredChildClassName})`]: {
                marginTop: theme.spacing(3)
            },

            '&::-webkit-scrollbar': {
                display: 'none'
            }
        },

        closeButton: {
            alignItems: 'center',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center'
        },

        header: {
            alignItems: 'center',
            boxSizing: 'border-box',
            display: 'flex',
            height: `${participantsPaneTheme.headerSize}px`,
            padding: '0 20px',
            justifyContent: 'flex-end'
        },

        antiCollapse: {
            fontSize: 0,

            '&:first-child': {
                display: 'none'
            },

            '&:first-child + *': {
                marginTop: 0
            }
        },

        footer: {
            display: 'flex',
            justifyContent: 'flex-end',
            padding: `${theme.spacing(4)}px ${participantsPaneTheme.panePadding}px`,

            '& > *:not(:last-child)': {
                marginRight: `${theme.spacing(3)}px`
            }
        },

        footerMoreContainer: {
            position: 'relative'
        }
    };
};

/**
 * Implements the participants list.
 */
class ParticipantsPane extends Component<Props, State> {
    /**
     * Initializes a new {@code ParticipantsPane} instance.
     *
     * @inheritdoc
     */
    constructor(props) {
        super(props);

        this.state = {
            contextOpen: false,
            searchString: ''
        };

        // Bind event handlers so they are only bound once per instance.
        this._onClosePane = this._onClosePane.bind(this);
        this._onDrawerClose = this._onDrawerClose.bind(this);
        this._onKeyPress = this._onKeyPress.bind(this);
        this._onMuteAll = this._onMuteAll.bind(this);
        this._onToggleContext = this._onToggleContext.bind(this);
        this._onWindowClickListener = this._onWindowClickListener.bind(this);
        this.setSearchString = this.setSearchString.bind(this);
    }


    /**
     * Implements React's {@link Component#componentDidMount()}.
     *
     * @inheritdoc
     */
    componentDidMount() {
        window.addEventListener('click', this._onWindowClickListener);
    }

    /**
     * Implements React's {@link Component#componentWillUnmount()}.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        window.removeEventListener('click', this._onWindowClickListener);
    }

    /**
     * Implements React's {@link Component#render}.
     *
     * @inheritdoc
     */
    render() {
        const {
            _isBreakoutRoomsSupported,
            _paneOpen,
            _showAddRoomButton,
            _showFooter,
            _showMoreActionsButton,
            _showMuteAllButton,
            classes,
            t
        } = this.props;
        const { contextOpen, searchString } = this.state;

        // when the pane is not open optimize to not
        // execute the MeetingParticipantList render for large list of participants
        if (!_paneOpen) {
            return null;
        }

        return (
            <div className = 'participants_pane'>
                <div className = 'participants_pane-content'>
                    <div className = { classes.header }>
                        <div
                            aria-label = { t('participantsPane.close', 'Close') }
                            className = { classes.closeButton }
                            onClick = { this._onClosePane }
                            onKeyPress = { this._onKeyPress }
                            role = 'button'
                            tabIndex = { 0 }>
                            <Icon
                                size = { 24 }
                                src = { IconClose } />
                        </div>
                    </div>
                    <div className = { classes.container }>
                        <LobbyParticipants />
                        <br className = { classes.antiCollapse } />
                        <MeetingParticipants
                            searchString = { searchString }
                            setSearchString = { this.setSearchString } />
                        {_isBreakoutRoomsSupported && <RoomList searchString = { searchString } />}
                        {_showAddRoomButton && <AddBreakoutRoomButton />}
                    </div>
                    {_showFooter && (
                        <div className = { classes.footer }>
                            {_showMuteAllButton && (
                                <Button
                                    accessibilityLabel = { t('participantsPane.actions.muteAll') }
                                    label = { t('participantsPane.actions.muteAll') }
                                    onClick = { this._onMuteAll }
                                    type = { BUTTON_TYPES.SECONDARY } />
                            )}
                            {_showMoreActionsButton && (
                                <div className = { classes.footerMoreContainer }>
                                    <Button
                                        accessibilityLabel = { t('participantsPane.actions.moreModerationActions') }
                                        icon = { IconHorizontalPoints }
                                        id = 'participants-pane-context-menu'
                                        onClick = { this._onToggleContext }
                                        type = { BUTTON_TYPES.SECONDARY } />
                                    <FooterContextMenu
                                        isOpen = { contextOpen }
                                        onDrawerClose = { this._onDrawerClose }
                                        onMouseLeave = { this._onToggleContext } />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    setSearchString: (string) => void;

    /**
     * Sets the search string.
     *
     * @param {string} newSearchString - The new search string.
     * @returns {void}
     */
    setSearchString(newSearchString) {
        this.setState({
            searchString: newSearchString
        });
    }

    _onClosePane: () => void;

    /**
     * Callback for closing the participant pane.
     *
     * @private
     * @returns {void}
     */
    _onClosePane() {
        this.props.dispatch(close());
    }

    _onDrawerClose: () => void;

    /**
     * Callback for closing the drawer.
     *
     * @private
     * @returns {void}
     */
    _onDrawerClose() {
        this.setState({
            contextOpen: false
        });
    }

    _onKeyPress: (Object) => void;

    /**
     * KeyPress handler for accessibility for closing the participants pane.
     *
     * @param {Object} e - The key event to handle.
     *
     * @returns {void}
     */
    _onKeyPress(e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            this._onClosePane();
        }
    }

    _onMuteAll: () => void;

    /**
     * The handler for clicking mute all button.
     *
     * @returns {void}
     */
    _onMuteAll() {
        this.props.dispatch(openDialog(MuteEveryoneDialog));
    }

    _onToggleContext: () => void;

    /**
     * Handler for toggling open/close of the footer context menu.
     *
     * @returns {void}
     */
    _onToggleContext() {
        this.setState({
            contextOpen: !this.state.contextOpen
        });
    }

    _onWindowClickListener: (event: Object) => void;

    /**
     * Window click event listener.
     *
     * @param {Event} e - The click event.
     * @returns {void}
     */
    _onWindowClickListener(e) {
        if (this.state.contextOpen && !findAncestorByClass(e.target, this.props.classes.footerMoreContainer)) {
            this.setState({
                contextOpen: false
            });
        }
    }


}

/**
 * Maps (parts of) the redux state to the React {@code Component} props of
 * {@code ParticipantsPane}.
 *
 * @param {Object} state - The redux state.
 * @protected
 * @returns {Props}
 */
function _mapStateToProps(state: Object) {
    const isPaneOpen = getParticipantsPaneOpen(state);
    const { conference } = state['features/base/conference'];
    const _isBreakoutRoomsSupported = conference?.getBreakoutRooms()?.isSupported();

    return {
        _isBreakoutRoomsSupported,
        _paneOpen: isPaneOpen,
        _showAddRoomButton: isAddBreakoutRoomButtonVisible(state),
        _showFooter: isLocalParticipantModerator(state),
        _showMuteAllButton: isMuteAllVisible(state),
        _showMoreActionsButton: isMoreActionsVisible(state)
    };
}

export default translate(connect(_mapStateToProps)(withStyles(styles)(ParticipantsPane)));
