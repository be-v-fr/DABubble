'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">da-bubble documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AddChannelComponent.html" data-type="entity-link" >AddChannelComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AddMembersAfterAddChannelComponent.html" data-type="entity-link" >AddMembersAfterAddChannelComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AddMembersComponent.html" data-type="entity-link" >AddMembersComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AnimationIntroComponent.html" data-type="entity-link" >AnimationIntroComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AppComponent.html" data-type="entity-link" >AppComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AuthComponent.html" data-type="entity-link" >AuthComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DirectMessageComponent.html" data-type="entity-link" >DirectMessageComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EditChannelComponent.html" data-type="entity-link" >EditChannelComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EditMainUserAvatarComponent.html" data-type="entity-link" >EditMainUserAvatarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EditMainUserProfileCardComponent.html" data-type="entity-link" >EditMainUserProfileCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EditUserProfileCardComponent.html" data-type="entity-link" >EditUserProfileCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ExpandableButtonComponent.html" data-type="entity-link" >ExpandableButtonComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HeaderComponent.html" data-type="entity-link" >HeaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HomeComponent.html" data-type="entity-link" >HomeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ImpressComponent.html" data-type="entity-link" >ImpressComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LegalFooterComponent.html" data-type="entity-link" >LegalFooterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginComponent.html" data-type="entity-link" >LoginComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LogOutCardComponent.html" data-type="entity-link" >LogOutCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MainChatComponent.html" data-type="entity-link" >MainChatComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MainUserProfileCardComponent.html" data-type="entity-link" >MainUserProfileCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MemberListComponent.html" data-type="entity-link" >MemberListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MessageBoxComponent.html" data-type="entity-link" >MessageBoxComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MessageItemComponent.html" data-type="entity-link" >MessageItemComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NavigationComponent.html" data-type="entity-link" >NavigationComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NewMessageComponent.html" data-type="entity-link" >NewMessageComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PickAvatarComponent.html" data-type="entity-link" >PickAvatarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PLAYGROUNDComponent.html" data-type="entity-link" >PLAYGROUNDComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PrivacypolicyComponent.html" data-type="entity-link" >PrivacypolicyComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RequestPwResetComponent.html" data-type="entity-link" >RequestPwResetComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ResetPwComponent.html" data-type="entity-link" >ResetPwComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SignUpComponent.html" data-type="entity-link" >SignUpComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ThreadComponent.html" data-type="entity-link" >ThreadComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TimeSeparatorComponent.html" data-type="entity-link" >TimeSeparatorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ToastNotificationComponent.html" data-type="entity-link" >ToastNotificationComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UserProfileCardComponent.html" data-type="entity-link" >UserProfileCardComponent</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/Channel.html" data-type="entity-link" >Channel</a>
                            </li>
                            <li class="link">
                                <a href="classes/Post.html" data-type="entity-link" >Post</a>
                            </li>
                            <li class="link">
                                <a href="classes/Reaction.html" data-type="entity-link" >Reaction</a>
                            </li>
                            <li class="link">
                                <a href="classes/Thread.html" data-type="entity-link" >Thread</a>
                            </li>
                            <li class="link">
                                <a href="classes/User.html" data-type="entity-link" >User</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/ActivityService.html" data-type="entity-link" >ActivityService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ChannelsService.html" data-type="entity-link" >ChannelsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EmojiService.html" data-type="entity-link" >EmojiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PostsService.html" data-type="entity-link" >PostsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ReactionsService.html" data-type="entity-link" >ReactionsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StorageService.html" data-type="entity-link" >StorageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ThreadsService.html" data-type="entity-link" >ThreadsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TimeService.html" data-type="entity-link" >TimeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UsersService.html" data-type="entity-link" >UsersService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/UserState.html" data-type="entity-link" >UserState</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});