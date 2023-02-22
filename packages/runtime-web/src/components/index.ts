import { appendApis, DEFAULT_API_NO_CONFLICT } from '../api/utils/extendApi'
import UIAnimation from './src/api/ui/animation/index'
import UICanvas from './src/api/ui/canvas/index'
import UIChooseCity from './src/api/ui/chooseCity/index'
import UIDatePicker from './src/api/ui/datePicker/index'
import UIInteractive from './src/api/ui/interactive/index'
import UIMultiLevelSelect from './src/api/ui/multiLevelSelect/index'
import UIOptionSelect from './src/api/ui/optionSelect/index'
import './src/base/tabbar'
import './src/base/tabbar-item'
import OpenAPI from './src/open/api'
import './src/private/index'
import NavbarAPI from './src/private/navbar-api'
import './src/private/page'
import pageScrollTo from './src/private/pageScrollTo'
import PulldownAPI from './src/private/pulldown-api'

appendApis(UIInteractive, DEFAULT_API_NO_CONFLICT)
appendApis(UIOptionSelect, DEFAULT_API_NO_CONFLICT)
appendApis(UIMultiLevelSelect, DEFAULT_API_NO_CONFLICT)
appendApis(UIAnimation, DEFAULT_API_NO_CONFLICT)
appendApis(UIDatePicker, DEFAULT_API_NO_CONFLICT)
appendApis(PulldownAPI, DEFAULT_API_NO_CONFLICT)
appendApis(NavbarAPI, DEFAULT_API_NO_CONFLICT)
appendApis(pageScrollTo, DEFAULT_API_NO_CONFLICT)
appendApis(OpenAPI, DEFAULT_API_NO_CONFLICT)
appendApis(UIChooseCity, DEFAULT_API_NO_CONFLICT)
appendApis(UICanvas, DEFAULT_API_NO_CONFLICT)
