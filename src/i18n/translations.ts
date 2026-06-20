export interface TranslationSet {
  code: string;
  name: string;
  flag: string;
  nav: Record<string, string>;
  months: string[];
  monthsShort: string[];
  dow: string[];
  dowFull: string[];
  onboarding: Record<string, string>;
  tracker: Record<string, string>;
  dayView: Record<string, string>;
  focus: Record<string, string>;
  stats: Record<string, string>;
  heatmap: Record<string, string>;
  gamify: Record<string, any>;
  manage: Record<string, string>;
  settings: Record<string, string>;
  footer: Record<string, string>;
  greeting: Record<string, string>;
  notif: Record<string, string>;
  catNames: Record<string, string>;
  errorBoundary: Record<string, string>;
  challenges: Record<string, string>;
  app: Record<string, string>;
}

export const LANGS: Record<string, TranslationSet> = {
  es: {
    code: "es", name: "Español", flag: "🇪🇸",
    nav: { tracker:"Tracker", today:"Hoy", stats:"Stats", heatmap:"Heatmap", xp:"XP", habits:"Hábitos" },
    months: ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],
    monthsShort: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],
    dow: ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"],
    dowFull: ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"],
    onboarding: {
      welcome: "Bienvenido a Forge",
      sub: "Tu tracker de hábitos personal. Vamos a configurar todo en 3 pasos.",
      step1: "¿Cómo te llamas?", step1ph: "Tu nombre o apodo",
      step2: "Elige tu idioma", step3: "Personaliza tu app",
      step4: "Primeros hábitos",
      themeDark: "Oscuro", themeLight: "Claro",
      accentLabel: "Color de acento",
      notifLabel: "Hora de recordatorio diario",
      templateTitle: "Empieza con una plantilla",
      templateSkip: "Empezar vacío",
      templateProd: "Productividad", templateHealth: "Salud", templateMind: "Mente",
      next: "Siguiente", back: "Atrás", finish: "¡Empezar!", theme: "Tema", previewLabel:"Vista previa — {n} hábitos",
    },
    tracker: { habit:"Hábito", completedDay:"Completadas / día", notesDay:"Notas del día", search:"Filtrar hábitos…", empty:"Sin hábitos todavía", emptyHint:"Ve a {settings} para agregar tu primer hábito.", noteTooltip:"Nota", dayLabel:"Día {d}", notePlaceholder:"Nota del día…", reorderHint:"Arrastra para reordenar", checkDone:"Completado: {name}", checkPending:"Marcar completado: {name}", failDone:"Fallaste: {name} — click para desmarcar", failPending:"¿Fallaste hoy? {name}", numHint:"(+1 / clic derecho -1)", failShort:"Fallaste", doneShort:"Completado", failPendingShort:"¿Fallaste hoy?" },
    dayView: { date:"{day} de {month} {year}", completed:"completado", pending:"pendiente" },
    focus: { mode:"Modo Focus", perfectDay:"¡Día perfecto! Todos los hábitos completados. 🏆", consecutive:"días seguidos", onlyCurrentMonth:"El modo Focus solo funciona en el mes actual.", empty:"No hay hábitos programados para este día." },
    stats: {
      compliance:"Cumplimiento", perfectDays:"Días perfectos", activeDays:"Días activos",
      habitsAbove:"Hábitos ≥ 80%", avgDay:"Prom / día", bestHabit:"Mejor hábito",
      improve:"A mejorar", ranking:"Ranking del mes", byCategory:"Por categoría",
      dailyProgress:"Progreso diario", habits:"hábitos",
      noHabits:"Agrega hábitos para ver estadísticas.", vsPrev:"vs mes anterior",
      weeklyBreakdown:"Resumen semanal", days:"días",
      period:"Período", periodMonth:"Mensual", periodQuarter:"Trimestral", periodSemester:"Semestral",
    },
    heatmap: { annualActivity:"Actividad anual", cellInfo:"Cada celda = 1 día · Color = % completados · Click para ir al mes", less:"Menos", more:"Más", monthly:"Resumen mensual", empty:"Sin datos de actividad. Agrega hábitos para ver tu mapa de calor." },
    gamify: { level:"Nivel", totalXP:"XP total", badges:"Badges", nextLevel:"XP para", maxLevel:"Nivel máximo alcanzado", youAreHere:"← TÚ", roadmap:"Mapa de niveles", levelNames:["Iniciado","Constante","Disciplinado","Imparable","Élite","Leyenda","Maestro"], totalChecks:"Checks totales", maxStreak:"Racha máxima", perfectDaysG:"Días perfectos", perfectWeeks:"Semanas perf.", activeDaysG:"Días activos", earned:"GANADO", lv:"Nv.", repaired:"Datos reparados automáticamente", badgeDefs:{ first_check:{name:"Primer paso",desc:"Completa tu primer hábito"}, streak_3:{name:"Racha de 3",desc:"3 días seguidos en un hábito"}, streak_7:{name:"Racha de 7",desc:"7 días seguidos en un hábito"}, streak_14:{name:"Racha de 14",desc:"14 días seguidos en un hábito"}, streak_30:{name:"Racha de 30",desc:"30 días seguidos en un hábito"}, streak_60:{name:"Racha de 60",desc:"60 días seguidos en un hábito"}, streak_100:{name:"Racha de 100",desc:"100 días seguidos en un hábito"}, perfect_day:{name:"Día perfecto",desc:"Completa todos los hábitos en un día"}, perfect_week:{name:"Semana perfecta",desc:"7 días perfectos consecutivos"}, perfect_month:{name:"Mes perfecto",desc:"Completa todos los días del mes"}, variety:{name:"Variedad",desc:"Hábitos en 4+ categorías distintas"}, century:{name:"100 checks",desc:"Completa 100 hábitos en total"}, consistent:{name:"Consistente",desc:"Activo 15+ días en un mes"}, grind:{name:"El Grind",desc:"Completa 500 hábitos en total"}, dedicated:{name:"Dedicación",desc:"Completa 2500 hábitos en total"}, legend:{name:"Leyenda",desc:"Llega al nivel 6"}, master:{name:"Maestro",desc:"Llega al nivel 7"} } },
    manage: {
      title:"Hábitos", newHabit:"+ Nuevo hábito", save:"Guardar", cancel:"Cancelar",
      name:"Nombre del hábito…", typeNormal:"Normal", typeNeg:"Negativo", typeNum:"Numérico",
      descNormal:"✓ Marcar cuando lo haces", descNeg:"⚠ Marcar cuando FALLAS", descNum:"# Meta por cantidad",
      categories:"Categorías", typesLegend:"Tipos de hábito", data:"Datos",
      exportJSON:"Export JSON", exportCSV:"Export CSV", importJSON:"Import JSON",
      testNotif:"Test notificación", notifDesktopOnly:"Solo disponible en app de escritorio",
      danger:"Zona peligrosa", deleteAll:"Borrar todos los datos", deleteConfirm:"¿Borrar TODOS los datos? Irreversible.",
      backupWarning:"⚠️ Importar sobreescribirá todos los datos actuales. Exporta primero.",
      deleteHabitConfirm:"¿Eliminar este hábito? Se perderán sus datos históricos.",
      toastAdded:"agregado", toastUpdated:"Hábito actualizado", toastDeleted:"Hábito eliminado",
      toastExportJSON:"Backup JSON exportado", toastExportCSV:"CSV exportado", toastImported:"Datos importados",
      toastNotif:"Notificación enviada",
      schedDaily:"Diario", schedWeekdays:"Días de semana", schedInterval:"Cada X días",
      schedDays:"Días", schedEvery:"Cada", schedDays2:"días", schedStartDay:"Empieza día",
      config:"Config", confirmLabel:"Eliminar", unitPlaceholder:"Unidad", themeDark:"🌙 Oscuro", themeLight:"☀️ Claro", showMore:"más", defaultUser:"Usuario",
    },
    settings: { title:"Configuración", lang:"Idioma", theme:"Tema", accent:"Color de acento", notifTime:"Hora de recordatorio", profile:"Perfil", username:"Tu nombre", save:"Guardar cambios", saved:"¡Guardado!", storageError:"⚠️ Error guardando datos — almacenamiento lleno", usernamePlaceholder:"Tu nombre" },
    footer: { createdBy:"Creado por", license:"MIT License" },
    greeting: { morning:"Buenos días", afternoon:"Buenas tardes", evening:"Buenas noches" },
    notif: { title:"Forge — Repaso del día 🎯", perfect:"¡Completaste todos los hábitos! 🏆", progress:"Llevas {done}/{total} ({pct}%). ¡Sigue!" },
    catNames: { salud:"Salud", trabajo:"Trabajo", mente:"Mente", social:"Social", habitos:"Rutina", otro:"Otro" },
    errorBoundary: { title:"Algo salió mal", message:"Forge encontró un error inesperado. Tus datos están seguros. Puedes intentar recuperarte o reiniciar la vista.", detail:"Detalle técnico", retry:"Reintentar", reload:"Recargar app", nuke:"Limpiar datos", nukeTitle:"¿Borrar todos los datos?", nukeMessage:"Esta acción no se puede deshacer. Se eliminarán todos tus hábitos, checks y configuración.", confirmLabel:"Eliminar todo", cancelLabel:"Cancelar" },
    challenges: { title:"Desafíos", active:"Activos", completed:"Completados", expired:"Expirados", noActive:"No hay desafíos activos", generate:"Generar nuevos", config:"Configuración", daily:"Diarios", difficulty:"Dificultad", easy:"Fácil", medium:"Medio", hard:"Difícil", xpReward:"recompensa", expiresIn:"expira en", completedToday:"completados hoy", streak:"racha de desafíos", totalXP:"XP ganado", progress:"progreso", congrats:"¡Desafío completado!", reward:"+{xp} XP", rachaTitle:"🔥 Racha: {name}", rachaDesc:"Mantén tu racha de {name} por {days} días más", consistenciaTitle:"📊 Consistencia", consistenciaDesc:"Cumple {n} hábitos hoy", variedadTitle:"🎨 Variedad", variedadDesc:"Usa {n} categorías diferentes hoy", superacionTitle:"⚔️ Superación", superacionDesc:"Supera tu mejor día ({pct}%)",       recuperacionTitle:"🔄 Recuperación: {name}", recuperacionDesc:"Vuelve a completar {name} (lo dejaste hace {days} días)" },
    app: { switchToLight:"Cambiar a tema claro", switchToDark:"Cambiar a tema oscuro" },
  },
  en: {
    code: "en", name: "English", flag: "🇬🇧",
    nav: { tracker:"Tracker", today:"Today", stats:"Stats", heatmap:"Heatmap", xp:"XP", habits:"Habits" },
    months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    monthsShort: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    dow: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
    dowFull: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
    onboarding: {
      welcome: "Welcome to Forge",
      sub: "Your personal habit tracker. Let's set everything up in 3 steps.",
      step1: "What's your name?", step1ph: "Your name or nickname",
      step2: "Choose your language", step3: "Customize your app",
      step4: "First habits",
      themeDark: "Dark", themeLight: "Light",
      accentLabel: "Accent color",
      notifLabel: "Daily reminder time",
      templateTitle: "Start with a template",
      templateSkip: "Start empty",
      templateProd: "Productivity", templateHealth: "Health", templateMind: "Mindset",
      next: "Next", back: "Back", finish: "Let's go!", theme: "Theme", previewLabel:"Preview — {n} habits",
    },
    tracker: { habit:"Habit", completedDay:"Completed / day", notesDay:"Day notes", search:"Filter habits…", empty:"No habits yet", emptyHint:"Go to {settings} to add your first habit.", noteTooltip:"Note", dayLabel:"Day {d}", notePlaceholder:"Day note…", reorderHint:"Drag to reorder", checkDone:"Done: {name}", checkPending:"Mark done: {name}", failDone:"Failed: {name} — click to unmark", failPending:"Did you fail today? {name}", numHint:"(+1 / right click -1)", failShort:"Failed", doneShort:"Done", failPendingShort:"Did you fail today?" },
    dayView: { date:"{day} {month} {year}", completed:"completed", pending:"pending" },
    focus: { mode:"Focus Mode", perfectDay:"Perfect day! All habits completed. 🏆", consecutive:"days in a row", onlyCurrentMonth:"Focus mode only works for the current month.", empty:"No habits scheduled for this day." },
    stats: {
      compliance:"Compliance", perfectDays:"Perfect days", activeDays:"Active days",
      habitsAbove:"Habits ≥ 80%", avgDay:"Avg / day", bestHabit:"Best habit",
      improve:"To improve", ranking:"Month ranking", byCategory:"By category",
      dailyProgress:"Daily progress", habits:"habits",
      noHabits:"Add habits to see statistics.", vsPrev:"vs prev month",
      weeklyBreakdown:"Weekly breakdown", days:"days",
      period:"Period", periodMonth:"Monthly", periodQuarter:"Quarterly", periodSemester:"Semester",
    },
    heatmap: { annualActivity:"Annual activity", cellInfo:"Each cell = 1 day · Color = % completed · Click to go to month", less:"Less", more:"More", monthly:"Monthly summary", empty:"No activity data. Add habits to see your heatmap." },
    gamify: { level:"Level", totalXP:"total XP", badges:"Badges", nextLevel:"XP to", maxLevel:"Max level reached", youAreHere:"← YOU", roadmap:"Level roadmap", levelNames:["Beginner","Steady","Disciplined","Unstoppable","Elite","Legend","Master"], totalChecks:"Total checks", maxStreak:"Max streak", perfectDaysG:"Perfect days", perfectWeeks:"Perfect weeks", activeDaysG:"Active days", earned:"EARNED", lv:"Lv.", repaired:"Data automatically repaired", badgeDefs:{ first_check:{name:"First step",desc:"Complete your first habit"}, streak_3:{name:"Streak of 3",desc:"3 days in a row on a habit"}, streak_7:{name:"Streak of 7",desc:"7 days in a row on a habit"}, streak_14:{name:"Streak of 14",desc:"14 days in a row on a habit"}, streak_30:{name:"Streak of 30",desc:"30 days in a row on a habit"}, streak_60:{name:"Streak of 60",desc:"60 days in a row on a habit"}, streak_100:{name:"Streak of 100",desc:"100 days in a row on a habit"}, perfect_day:{name:"Perfect day",desc:"Complete all habits in a day"}, perfect_week:{name:"Perfect week",desc:"7 perfect days in a row"}, perfect_month:{name:"Perfect month",desc:"Complete every day of the month"}, variety:{name:"Variety",desc:"Habits in 4+ different categories"}, century:{name:"100 checks",desc:"Complete 100 habits total"}, consistent:{name:"Consistent",desc:"Active 15+ days in a month"}, grind:{name:"The Grind",desc:"Complete 500 habits total"}, dedicated:{name:"Dedication",desc:"Complete 2500 habits total"}, legend:{name:"Legend",desc:"Reach level 6"}, master:{name:"Master",desc:"Reach level 7"} } },
    manage: {
      title:"Habits", newHabit:"+ New habit", save:"Save", cancel:"Cancel",
      name:"Habit name…", typeNormal:"Normal", typeNeg:"Negative", typeNum:"Numeric",
      descNormal:"✓ Mark when you do it", descNeg:"⚠ Mark when you FAIL", descNum:"# Quantity goal",
      categories:"Categories", typesLegend:"Habit types", data:"Data",
      exportJSON:"Export JSON", exportCSV:"Export CSV", importJSON:"Import JSON",
      testNotif:"Test notification", notifDesktopOnly:"Only available in desktop app",
      danger:"Danger zone", deleteAll:"Delete all data", deleteConfirm:"Delete ALL data? Irreversible.",
      backupWarning:"⚠️ Importing will overwrite all current data. Export first.",
      deleteHabitConfirm:"Delete this habit? Historical data will be lost.",
      toastAdded:"added", toastUpdated:"Habit updated", toastDeleted:"Habit deleted",
      toastExportJSON:"JSON backup exported", toastExportCSV:"CSV exported", toastImported:"Data imported",
      toastNotif:"Notification sent",
      schedDaily:"Daily", schedWeekdays:"Weekdays", schedInterval:"Every X days",
      schedDays:"Days", schedEvery:"Every", schedDays2:"days", schedStartDay:"Start day",
      config:"Config", confirmLabel:"Delete", unitPlaceholder:"Unit", themeDark:"🌙 Dark", themeLight:"☀️ Light", showMore:"more", defaultUser:"User",
    },
    settings: { title:"Settings", lang:"Language", theme:"Theme", accent:"Accent color", notifTime:"Reminder time", profile:"Profile", username:"Your name", save:"Save changes", saved:"Saved!", storageError:"⚠️ Error saving data — storage full", usernamePlaceholder:"Your name" },
    footer: { createdBy:"Created by", license:"MIT License" },
    greeting: { morning:"Good morning", afternoon:"Good afternoon", evening:"Good evening" },
    notif: { title:"Forge — Daily check 🎯", perfect:"All habits completed today! 🏆", progress:"You have {done}/{total} ({pct}%). Keep going!" },
    catNames: { salud:"Health", trabajo:"Work", mente:"Mind", social:"Social", habitos:"Routine", otro:"Other" },
    errorBoundary: { title:"Something went wrong", message:"Forge encountered an unexpected error. Your data is safe. You can try to recover or restart the view.", detail:"Technical details", retry:"Retry", reload:"Reload app", nuke:"Clear data", nukeTitle:"Delete all data?", nukeMessage:"This action cannot be undone. All your habits, checks, and settings will be removed.", confirmLabel:"Delete all", cancelLabel:"Cancel" },
    challenges: { title:"Challenges", active:"Active", completed:"Completed", expired:"Expired", noActive:"No active challenges", generate:"Generate new", config:"Settings", daily:"Daily", difficulty:"Difficulty", easy:"Easy", medium:"Medium", hard:"Hard", xpReward:"reward", expiresIn:"expires in", completedToday:"completed today", streak:"challenge streak", totalXP:"XP earned", progress:"progress", congrats:"Challenge completed!", reward:"+{xp} XP", rachaTitle:"🔥 Streak: {name}", rachaDesc:"Keep your {name} streak for {days} more days", consistenciaTitle:"📊 Consistency", consistenciaDesc:"Complete {n} habits today", variedadTitle:"🎨 Variety", variedadDesc:"Use {n} different categories today", superacionTitle:"⚔️ Improvement", superacionDesc:"Beat your best day ({pct}%)",       recuperacionTitle:"🔄 Recovery: {name}", recuperacionDesc:"Complete {name} again (you dropped it {days} days ago)" },
    app: { switchToLight:"Switch to light theme", switchToDark:"Switch to dark theme" },
  },
  pt: {
    code: "pt", name: "Português", flag: "🇧🇷",
    nav: { tracker:"Tracker", today:"Hoje", stats:"Stats", heatmap:"Heatmap", xp:"XP", habits:"Hábitos" },
    months: ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
    monthsShort: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
    dow: ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"],
    dowFull: ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"],
    onboarding: {
      welcome: "Bem-vindo ao Forge",
      sub: "Seu tracker de hábitos pessoal. Vamos configurar tudo em 3 passos.",
      step1: "Qual é o seu nome?", step1ph: "Seu nome ou apelido",
      step2: "Escolha seu idioma", step3: "Personalize seu app",
      step4: "Primeiros hábitos",
      themeDark: "Escuro", themeLight: "Claro",
      accentLabel: "Cor de destaque",
      notifLabel: "Hora do lembrete diário",
      templateTitle: "Comece com um modelo",
      templateSkip: "Começar vazio",
      templateProd: "Produtividade", templateHealth: "Saúde", templateMind: "Mente",
      next: "Próximo", back: "Voltar", finish: "Vamos lá!", theme: "Tema", previewLabel:"Pré-visualização — {n} hábitos",
    },
    tracker: { habit:"Hábito", completedDay:"Concluídos / dia", notesDay:"Notas do dia", search:"Filtrar hábitos…", empty:"Nenhum hábito ainda", emptyHint:"Vá para {settings} para adicionar seu primeiro hábito.", noteTooltip:"Nota", dayLabel:"Dia {d}", notePlaceholder:"Nota do dia…", reorderHint:"Arrastar para reordenar", checkDone:"Concluído: {name}", checkPending:"Marcar concluído: {name}", failDone:"Falhou: {name} — clique para desmarcar", failPending:"Você falhou hoje? {name}", numHint:"(+1 / clique direito -1)", failShort:"Falhou", doneShort:"Concluído", failPendingShort:"Você falhou hoje?" },
    dayView: { date:"{day} de {month} {year}", completed:"concluído", pending:"pendente" },
    focus: { mode:"Modo Foco", perfectDay:"Dia perfeito! Todos os hábitos concluídos. 🏆", consecutive:"dias seguidos", onlyCurrentMonth:"O modo Foco só funciona no mês atual.", empty:"Nenhum hábito agendado para este dia." },
    stats: {
      compliance:"Cumprimento", perfectDays:"Dias perfeitos", activeDays:"Dias ativos",
      habitsAbove:"Hábitos ≥ 80%", avgDay:"Média / dia", bestHabit:"Melhor hábito",
      improve:"Melhorar", ranking:"Ranking do mês", byCategory:"Por categoria",
      dailyProgress:"Progresso diário", habits:"hábitos",
      noHabits:"Adicione hábitos para ver estatísticas.", vsPrev:"vs mês anterior",
      weeklyBreakdown:"Resumo semanal", days:"dias",
      period:"Período", periodMonth:"Mensal", periodQuarter:"Trimestral", periodSemester:"Semestral",
    },
    heatmap: { annualActivity:"Atividade anual", cellInfo:"Cada célula = 1 dia · Cor = % concluídos · Clique para ir ao mês", less:"Menos", more:"Mais", monthly:"Resumo mensal", empty:"Sem dados de atividade. Adicione hábitos para ver seu mapa de calor." },
    gamify: { level:"Nível", totalXP:"XP total", badges:"Conquistas", nextLevel:"XP para", maxLevel:"Nível máximo atingido", youAreHere:"← VOCÊ", roadmap:"Mapa de níveis", levelNames:["Iniciante","Constante","Disciplinado","Imparável","Elite","Lenda","Mestre"], totalChecks:"Checks totais", maxStreak:"Sequência máx", perfectDaysG:"Dias perfeitos", perfectWeeks:"Semanas perf.", activeDaysG:"Dias ativos", earned:"GANHO", lv:"Nv.", repaired:"Dados reparados automaticamente", badgeDefs:{ first_check:{name:"Primeiro passo",desc:"Conclua seu primeiro hábito"}, streak_3:{name:"Sequência de 3",desc:"3 dias seguidos em um hábito"}, streak_7:{name:"Sequência de 7",desc:"7 dias seguidos em um hábito"}, streak_14:{name:"Sequência de 14",desc:"14 dias seguidos em um hábito"}, streak_30:{name:"Sequência de 30",desc:"30 dias seguidos em um hábito"}, streak_60:{name:"Sequência de 60",desc:"60 dias seguidos em um hábito"}, streak_100:{name:"Sequência de 100",desc:"100 dias seguidos em um hábito"}, perfect_day:{name:"Dia perfeito",desc:"Conclua todos os hábitos em um dia"}, perfect_week:{name:"Semana perfeita",desc:"7 dias perfeitos seguidos"}, perfect_month:{name:"Mês perfeito",desc:"Conclua todos os dias do mês"}, variety:{name:"Variedade",desc:"Hábitos em 4+ categorias diferentes"}, century:{name:"100 checks",desc:"Conclua 100 hábitos no total"}, consistent:{name:"Consistente",desc:"Ativo 15+ dias em um mês"}, grind:{name:"O Grind",desc:"Conclua 500 hábitos no total"}, dedicated:{name:"Dedicação",desc:"Conclua 2500 hábitos no total"}, legend:{name:"Lenda",desc:"Alcance o nível 6"}, master:{name:"Mestre",desc:"Alcance o nível 7"} } },
    manage: {
      title:"Hábitos", newHabit:"+ Novo hábito", save:"Salvar", cancel:"Cancelar",
      name:"Nome do hábito…", typeNormal:"Normal", typeNeg:"Negativo", typeNum:"Numérico",
      descNormal:"✓ Marcar quando fizer", descNeg:"⚠ Marcar quando FALHAR", descNum:"# Meta por quantidade",
      categories:"Categorias", typesLegend:"Tipos de hábito", data:"Dados",
      exportJSON:"Exportar JSON", exportCSV:"Exportar CSV", importJSON:"Importar JSON",
      testNotif:"Testar notificação", notifDesktopOnly:"Só disponível no app desktop",
      danger:"Zona perigosa", deleteAll:"Apagar todos os dados", deleteConfirm:"Apagar TODOS os dados? Irreversível.",
      backupWarning:"⚠️ Importar sobrescreverá todos os dados atuais. Exporte primeiro.",
      deleteHabitConfirm:"Excluir este hábito? Os dados históricos serão perdidos.",
      toastAdded:"adicionado", toastUpdated:"Hábito atualizado", toastDeleted:"Hábito excluído",
      toastExportJSON:"Backup JSON exportado", toastExportCSV:"CSV exportado", toastImported:"Dados importados",
      toastNotif:"Notificação enviada",
      schedDaily:"Diário", schedWeekdays:"Dias úteis", schedInterval:"A cada X dias",
      schedDays:"Dias", schedEvery:"A cada", schedDays2:"dias", schedStartDay:"Começa dia",
      config:"Config", confirmLabel:"Excluir", unitPlaceholder:"Unidade", themeDark:"🌙 Escuro", themeLight:"☀️ Claro", showMore:"mais", defaultUser:"Usuário",
    },
    settings: { title:"Configurações", lang:"Idioma", theme:"Tema", accent:"Cor de destaque", notifTime:"Hora do lembrete", profile:"Perfil", username:"Seu nome", save:"Salvar alterações", saved:"Salvo!", storageError:"⚠️ Erro ao salvar dados — armazenamento cheio", usernamePlaceholder:"Seu nome" },
    footer: { createdBy:"Criado por", license:"MIT License" },
    greeting: { morning:"Bom dia", afternoon:"Boa tarde", evening:"Boa noite" },
    notif: { title:"Forge — Revisão do dia 🎯", perfect:"Todos os hábitos concluídos hoje! 🏆", progress:"Você tem {done}/{total} ({pct}%). Continue!" },
    catNames: { salud:"Saúde", trabajo:"Trabalho", mente:"Mente", social:"Social", habitos:"Rotina", outro:"Outro" },
    errorBoundary: { title:"Algo deu errado", message:"Forge encontrou um erro inesperado. Seus dados estão seguros. Você pode tentar se recuperar ou reiniciar a visualização.", detail:"Detalhes técnicos", retry:"Tentar novamente", reload:"Recarregar app", nuke:"Limpar dados", nukeTitle:"Apagar todos os dados?", nukeMessage:"Esta ação não pode ser desfeita. Todos os seus hábitos, verificações e configurações serão removidos.", confirmLabel:"Apagar tudo", cancelLabel:"Cancelar" },
    challenges: { title:"Desafios", active:"Ativos", completed:"Concluídos", expired:"Expirados", noActive:"Nenhum desafio ativo", generate:"Gerar novos", config:"Configuração", daily:"Diários", difficulty:"Dificuldade", easy:"Fácil", medium:"Médio", hard:"Difícil", xpReward:"recompensa", expiresIn:"expira em", completedToday:"concluídos hoje", streak:"sequência de desafios", totalXP:"XP ganho", progress:"progresso", congrats:"Desafio concluído!", reward:"+{xp} XP", rachaTitle:"🔥 Sequência: {name}", rachaDesc:"Mantenha sua sequência de {name} por {days} dias", consistenciaTitle:"📊 Consistência", consistenciaDesc:"Conclua {n} hábitos hoje", variedadTitle:"🎨 Variedade", variedadDesc:"Use {n} categorias diferentes hoje", superacionTitle:"⚔️ Superação", superacionDesc:"Supere seu melhor dia ({pct}%)",       recuperacionTitle:"🔄 Recuperação: {name}", recuperacionDesc:"Conclua {name} novamente (você parou há {days} dias)" },
    app: { switchToLight:"Mudar para tema claro", switchToDark:"Mudar para tema escuro" },
  },
};

export const DAYS_IN_MONTH = (y: number, m: number): number => new Date(y, m + 1, 0).getDate();
