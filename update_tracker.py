import sys
path = r"c:\Users\agarw\health-reminder-new4\components\patient-dashboard\MedicineTracker.jsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import
if "INDIAN_MEDICINE_TIMINGS" not in content:
    content = content.replace("import Sidebar from './Sidebar';", "import Sidebar from './Sidebar';\nimport { INDIAN_MEDICINE_TIMINGS } from '@/lib/medicineTimings';")

# 2. Update all initializations
old_init = """    foodRelation: 'After Food',
    morning: false,
    afternoon: false,
    evening: false,
    night: false,"""
new_init = """    foodRelation: 'after_food',
    morning: false,
    afternoon: false,
    evening: false,
    night: false,
    empty_stomach: false,
    after_breakfast: false,
    after_lunch: false,
    before_dinner: false,
    after_dinner: false,
    before_bed: false,"""
content = content.replace(old_init, new_init)

old_init_2 = """      foodRelation: 'After Food',
      morning: false,
      afternoon: false,
      evening: false,
      night: false,"""
new_init_2 = """      foodRelation: 'after_food',
      morning: false,
      afternoon: false,
      evening: false,
      night: false,
      empty_stomach: false,
      after_breakfast: false,
      after_lunch: false,
      before_dinner: false,
      after_dinner: false,
      before_bed: false,"""
content = content.replace(old_init_2, new_init_2)

old_init_3 = """        foodRelation: 'After Food',
        morning: false,
        afternoon: false,
        evening: false,
        night: false,"""
new_init_3 = """        foodRelation: 'after_food',
        morning: false,
        afternoon: false,
        evening: false,
        night: false,
        empty_stomach: false,
        after_breakfast: false,
        after_lunch: false,
        before_dinner: false,
        after_dinner: false,
        before_bed: false,"""
content = content.replace(old_init_3, new_init_3)

# 3. Update edit modal
old_edit = """      foodRelation: reminder.foodRelation,
      morning: reminder.morning,
      afternoon: reminder.afternoon,
      evening: reminder.evening,
      night: reminder.night,"""
new_edit = """      foodRelation: reminder.foodRelation,
      morning: reminder.morning || false,
      afternoon: reminder.afternoon || false,
      evening: reminder.evening || false,
      night: reminder.night || false,
      empty_stomach: reminder.empty_stomach || false,
      after_breakfast: reminder.after_breakfast || false,
      after_lunch: reminder.after_lunch || false,
      before_dinner: reminder.before_dinner || false,
      after_dinner: reminder.after_dinner || false,
      before_bed: reminder.before_bed || false,"""
content = content.replace(old_edit, new_edit)

# 4. Update food relation dropdown
old_dropdown = """                    <select
                      value={formData.foodRelation}
                      onChange={(e) => setFormData({ ...formData, foodRelation: e.target.value })}
                      className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-[#111827]"
                    >
                      <option value="After Food">After Food</option>
                      <option value="Before Food">Before Food</option>
                      <option value="With Food">With Food</option>
                      <option value="No Relation">No Relation</option>
                    </select>"""
new_dropdown = """                    <select
                      value={formData.foodRelation}
                      onChange={(e) => setFormData({ ...formData, foodRelation: e.target.value })}
                      className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-[#111827]"
                    >
                      <option value="empty_stomach">???? ???? ??? (Empty Stomach)</option>
                      <option value="before_food">???? ?? ???? (Before Food)</option>
                      <option value="with_food">???? ?? ??? (With Food)</option>
                      <option value="after_food">???? ?? ??? (After Food)</option>
                      <option value="no_relation">??? ????? ???? (No Relation)</option>
                      <option value="After Food" style={{display: 'none'}}>After Food</option>
                      <option value="Before Food" style={{display: 'none'}}>Before Food</option>
                      <option value="With Food" style={{display: 'none'}}>With Food</option>
                      <option value="No Relation" style={{display: 'none'}}>No Relation</option>
                    </select>"""
content = content.replace(old_dropdown, new_dropdown)

# 5. Update schedules mapping
old_schedules = """                <div className="flex flex-wrap gap-4">
                  {['Morning', 'Afternoon', 'Evening', 'Night'].map((shift) => {
                    const key = shift.toLowerCase();
                    return (
                      <label key={key} className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          formData[key] ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white group-hover:border-blue-400'
                        }`}>
                          {formData[key] && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className={`text-sm font-semibold transition-colors ${
                          formData[key] ? 'text-blue-700' : 'text-[#475569] group-hover:text-blue-600'
                        }`}>
                          {shift}
                        </span>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={formData[key]}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                        />
                      </label>
                    );
                  })}
                </div>"""
new_schedules = """                <div className="flex flex-wrap gap-4">
                  {INDIAN_MEDICINE_TIMINGS.map((shift) => {
                    const key = shift.id;
                    return (
                      <label key={key} className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          formData[key] ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white group-hover:border-blue-400'
                        }`}>
                          {formData[key] && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className={`text-sm font-semibold transition-colors ${
                          formData[key] ? 'text-blue-700' : 'text-[#475569] group-hover:text-blue-600'
                        }`}>
                          {shift.label}
                        </span>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={formData[key] || false}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                        />
                      </label>
                    );
                  })}
                </div>"""
content = content.replace(old_schedules, new_schedules)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updates applied to MedicineTracker.jsx")

