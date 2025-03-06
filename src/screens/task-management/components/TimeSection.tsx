{{ ... }}
};

/**
 * Stilurile componentei TimeSection
 * 
 * GHID DE MODIFICARE:
 * - Toate valorile de spațiere trebuie să folosească ACCESSIBILITY.SPACING
 * - Toate valorile de font trebuie să folosească ACCESSIBILITY.TYPOGRAPHY
 * - Toate culorile trebuie să folosească ACCESSIBILITY.COLORS
 * - Elementele interactive trebuie să respecte dimensiunile minime ACCESSIBILITY.TOUCH_TARGET
 */
const styles = StyleSheet.create({
  /**
   * Containerul principal al secțiunii
   * 
   * IMPACT MODIFICARE:
   * - Modificarea marginii va afecta spațierea verticală între secțiuni
   * - Valoarea SM_MD oferă un echilibru între densitate și lizibilitate
   */
  container: {
    marginBottom: ACCESSIBILITY.SPACING.SM_MD, // Folosim valoarea intermediară pentru spațierea dintre secțiuni
  },
  /**
   * Spațiul dintre categorii
   * 
   * IMPACT MODIFICARE:
   * - Reducerea înălțimii crește densitatea informațională
   * - Valoarea minimă de 2px menține o separare vizuală subtilă
   */
  categorySpacing: {
    height: 2, // Reducem spațierea dintre categorii
  },
  /**
   * Containerul principal al secțiunii cu bordură colorată
   * 
   * IMPACT MODIFICARE:
   * - Bordura colorată din stânga ajută la identificarea vizuală a perioadei
   * - Umbrirea subtilă oferă adâncime vizuală și separă secțiunile
   * - Marginile orizontale definesc alinierea cu alte elemente din UI
   */
  sectionContainer: {
    marginHorizontal: ACCESSIBILITY.SPACING.SM,
    borderLeftWidth: 4,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    overflow: 'hidden',
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    // Umbre pentru întreaga secțiune
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  /**
   * Stilul pentru header-ul secțiunii
   * 
   * IMPACT MODIFICARE:
   * - Spațierea internă afectează dimensiunea zonei de touch
   * - Flexbox asigură alinierea corectă a elementelor
   * - Reducerea padding-ului vertical optimizează spațiul vertical
   */
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: ACCESSIBILITY.SPACING.BASE,
    paddingVertical: 6,
  },
  /**
   * Stilul specific pentru header-ul secțiunii COMPLETED
   * 
   * IMPACT MODIFICARE:
   * - Fundalul subtil diferențiază vizual secțiunea de task-uri completate
   * - Bordura inferioară creează o separare vizuală între header și conținut
   */
  completedSectionHeader: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  /**
   * Containerul pentru titlul secțiunii și iconița
   * 
   * IMPACT MODIFICARE:
   * - Spațierea între elemente (gap) afectează lizibilitatea
   * - Alinierea pe centru asigură aspect vizual consistent
   */
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ACCESSIBILITY.SPACING.SM,
  },
  /**
   * Stilul pentru titlul secțiunii
   * 
   * IMPACT MODIFICARE:
   * - Dimensiunea fontului afectează ierarhia vizuală și lizibilitatea
   * - Greutatea fontului (MEDIUM) oferă importanță vizuală
   * - Culoarea trebuie să asigure contrast suficient (minim 4.5:1)
   */
  title: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  /**
   * Stilul specific pentru titlul secțiunii COMPLETED
   * 
   * IMPACT MODIFICARE:
   * - Culoarea secundară reduce importanța vizuală a secțiunii completate
   * - Menține greutatea MEDIUM pentru consistență cu celelalte titluri
   */
  completedSectionTitle: {
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
  },
  /**
   * Stilul pentru numărul de task-uri
   * 
   * IMPACT MODIFICARE:
   * - Dimensiunea mai mică a fontului indică importanță secundară
   * - Culoarea secundară reduce contrastul și importanța vizuală
   * - Marginea din stânga asigură spațiere consistentă față de titlu
   */
  taskCount: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    marginLeft: ACCESSIBILITY.SPACING.XS,
  },
  /**
   * Containerul pentru butoanele de acțiune din header
   * 
   * IMPACT MODIFICARE:
   * - Flexbox asigură alinierea corectă a butoanelor
   * - Spațierea între butoane afectează accesibilitatea
   */
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  /**
   * Stilul pentru butonul de adăugare task
   * 
   * IMPACT MODIFICARE:
   * - Dimensiunile respectă standardele de accesibilitate (minim 44x44px)
   * - Centrarea conținutului asigură aspect vizual consistent
   * - Zona de touch trebuie să fie suficient de mare pentru utilizare facilă
   */
  addButton: {
    width: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH,
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /**
   * Containerul pentru lista de task-uri
   * 
   * IMPACT MODIFICARE:
   * - Spațierea internă afectează densitatea informațională
   * - Eliminarea umbrelor și bordurilor simplifică aspectul vizual
   * - Fundalul transparent permite evidențierea task-urilor individuale
   */
  taskListContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: ACCESSIBILITY.SPACING.XS,
    paddingVertical: ACCESSIBILITY.SPACING.XS,
    // Fără umbră sau border
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  /**
   * Stilul pentru lista de task-uri active
   * 
   * IMPACT MODIFICARE:
   * - Eliminarea padding-ului superior reduce spațiul vertical
   * - Păstrarea padding-ului inferior asigură spațiere după ultimul task
   * - Fundalul transparent permite evidențierea task-urilor individuale
   */
  taskList: {
    paddingTop: 0,
    paddingBottom: ACCESSIBILITY.SPACING.XS,
    backgroundColor: 'transparent',
  },
  /**
   * Wrapper pentru elementele de task individuale
   * 
   * IMPACT MODIFICARE:
   * - Eliminarea marginilor și padding-ului reduce spațiul vertical
   * - Fundalul transparent permite stilizarea în componenta TaskItem
   * - Eliminarea border-radius menține aspect vizual consistent
   */
  taskItemWrapper: {
    margin: 0,
    padding: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  /**
   * Stilul specific pentru task-urile completate
   * 
   * IMPACT MODIFICARE:
   * - Marginea inferioară minimă (2px) asigură separare vizuală subtilă
   * - Eliminarea altor spațieri maximizează densitatea informațională
   */
  completedTaskItemWrapper: {
    margin: 0,
    padding: 0,
    marginBottom: 2,
  },
  /**
   * Header-ul pentru secțiunea de task-uri completate
   * 
   * IMPACT MODIFICARE:
   * - Bordura superioară creează separare vizuală de task-urile active
   * - Spațierea asimetrică (mai mult sus, mai puțin jos) optimizează spațiul
   * - Marginea superioară adaugă spațiu după ultimul task activ
   */
  completedTasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: ACCESSIBILITY.SPACING.SM,
    marginTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  /**
   * Stilul pentru titlul secțiunii de task-uri completate
   * 
   * IMPACT MODIFICARE:
   * - Dimensiunea redusă a fontului (12px) economisește spațiu vertical
   * - Culoarea secundară reduce importanța vizuală
   * - Greutatea MEDIUM asigură lizibilitate la dimensiune mică
   */
  completedTasksTitle: {
    fontSize: 12,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
  },
  /**
   * Lista de task-uri completate
   * 
   * IMPACT MODIFICARE:
   * - Spațierea redusă maximizează densitatea informațională
   * - Fundalul transparent permite evidențierea task-urilor individuale
   * - Eliminarea marginii superioare reduce spațiul vertical
   */
  completedTasksList: {
    backgroundColor: 'transparent',
    paddingVertical: 4,
    paddingHorizontal: ACCESSIBILITY.SPACING.XS,
    marginTop: 0,
  },
  /**
   * Stilul pentru starea goală (când nu există task-uri)
   * 
   * IMPACT MODIFICARE:
   * - Înălțimea minimă (30px) asigură vizibilitate suficientă
   * - Centrarea conținutului oferă aspect vizual plăcut
   * - Padding-ul minim economisește spațiu vertical
   */
  emptyState: {
    padding: ACCESSIBILITY.SPACING.XS,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 30, // Reducem înălțimea minimă, dar păstrăm-o suficient de mare pentru accesibilitate
  },
  /**
   * Stilul specific pentru starea goală în secțiunile non-COMPLETED
   * 
   * IMPACT MODIFICARE:
   * - Înălțimea minimă și mai redusă (24px) maximizează densitatea
   * - Padding-ul vertical minim (2px) economisește spațiu
   * - Menține vizibilitatea mesajului de stare goală
   */
  compactEmptyState: {
    minHeight: 24, // Înălțime minimă și mai redusă pentru secțiunile non-COMPLETED
    paddingVertical: 2,
  },
  /**
   * Stilul pentru textul din starea goală
   * 
   * IMPACT MODIFICARE:
   * - Dimensiunea redusă a fontului economisește spațiu vertical
   * - Stilul italic diferențiază vizual mesajul de stare goală
   * - Culoarea secundară reduce importanța vizuală
   * - Alinierea centrată oferă aspect vizual plăcut
   */
  emptyStateText: {
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  /**
   * Separatorul vizual între secțiunile normale și secțiunea COMPLETED
   * 
   * IMPACT MODIFICARE:
   * - Înălțimea (2px) asigură vizibilitate suficientă
   * - Culoarea semi-transparentă oferă contrast subtil
   * - Marginile orizontale aliniază separatorul cu containerele secțiunilor
   * - Marginile verticale creează spațiere vizuală între secțiuni
   */
  sectionSeparator: {
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginHorizontal: ACCESSIBILITY.SPACING.SM,
    marginTop: ACCESSIBILITY.SPACING.MD,
    marginBottom: ACCESSIBILITY.SPACING.MD,
  }
});

/**
 * Export-ul componentei TimeSection
 * 
 * Această componentă este folosită în TaskManagementScreen pentru afișarea
 * task-urilor organizate pe perioade de timp (dimineață, după-amiază, seară, completate).
 * 
 * UTILIZARE:
 * <TimeSection
 *   period={periodObject}
 *   tasks={tasksArray}
 *   onAddTask={handleAddTask}
 *   onToggleTask={handleToggleTask}
 *   onDeleteTask={handleDeleteTask}
 *   onUpdateTask={handleUpdateTask}
 * />
 */
export default TimeSection;