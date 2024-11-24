import cahier from "./cahier"
import home from "./home"
import mention from "./mention"
import second from "./second"
import utilisateur from "./utilisateur"

export default [
  ...home, //dashboard
  ...cahier,
  ...mention,
  ...second, //syllabus
  ...utilisateur,
]
