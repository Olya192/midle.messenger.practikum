import App from './src/App.ts'
import { ButtonBack } from './src/components/button/ButtonBack.ts';
import { ButtonForm } from './src/components/button/ButtonForm.ts';
import { ChatsCard } from './src/components/chatsCard/ChatsCard.ts';
import { Footer } from './src/components/footer/Footer.ts';
import { AuthorizForm } from './src/components/form/AuthorizForm.ts';
import { RegisdtrationForm } from './src/components/form/RegisdtrationForm.ts';
import { InformCard } from './src/components/imformCard/InformCard.ts';
import { InputForm } from './src/components/input/InputForm.ts';
import { InputProfile } from './src/components/input/InputProfile.ts';
import { Link } from './src/components/link/Link.ts';
import { MessagesCard } from './src/components/messegCard/MessagesCard.ts';
import { registerComponent } from './src/framework/ComponentRegistry.ts';
import { authorization, registration } from './src/mock/authorization.ts';
import { mockContacts, mockData, mockMessages } from './src/mock/chats.ts';
import { passwordRedact, profile, profileRedact } from './src/mock/profile.ts';
import { AutorizationPage } from './src/pages/autorizationPage/autorizationPage.ts';
import { ChatsPage } from './src/pages/chatsPage/ChatsPage.ts';
import { Error404 } from './src/pages/errors/404errorPage.ts';
import { Error500 } from './src/pages/errors/500errorPage.ts';
import { ProfilePage } from './src/pages/profilePage/ProfilePage.ts';
import { RegisdtrationPage } from './src/pages/regisdtrationPage/RegisdtrationPage.ts';



registerComponent(InputForm);
registerComponent(ButtonForm);
registerComponent(Link);
registerComponent(ChatsCard);
registerComponent(MessagesCard);
registerComponent(InformCard);
registerComponent(InputProfile);
registerComponent(AuthorizForm);
registerComponent(ButtonBack);
registerComponent(RegisdtrationForm);
registerComponent(Footer);

registerComponent(ChatsPage);
registerComponent(AutorizationPage);
registerComponent(Error404);
registerComponent(Error500);
registerComponent(ProfilePage);
registerComponent(RegisdtrationPage);



const appProps = {
  authorization: authorization,
  registration: registration,
  mockContacts: mockContacts,
  mockMessages: mockMessages,
  mockData: mockData,
  profile: profile,
  profileRedact: profileRedact,
  passwordRedact: passwordRedact
};

// Запускаем приложение
document.addEventListener('DOMContentLoaded', () => {
  const app = new App(appProps);
  app.render();
});
 
