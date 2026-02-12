// 'use strict';

// INSERT
const createInsertPlaceholders = (obj) => {
	const keys = Object.keys(obj);
	let fieldsArr = [], placeholdersArr = [], valuesArr = [];
	for(let i = 0; i <= keys.length; ++i) {
		if(i === keys.length) {
			return {
				fields: fieldsArr.join(", "),
				placeholders: placeholdersArr.join(", "),
				values: valuesArr
			};
		} else {
			fieldsArr.push(keys[i]);
			// placeholdersArr.push(`$${i+1}`);
			placeholdersArr.push(`?`);
			valuesArr.push(obj[keys[i]]);
		}
	}
}

// SELECT and DELETE
const createConditionsString = (obj) => {
	const keys = Object.keys(obj);
	let conditionFieldsArr = [], valuesArr = [];
	for(let i = 0; i <= keys.length; ++i) {
		if(i === keys.length) {
			return {
				conditionFields: conditionFieldsArr.join(" AND "),
				values: valuesArr
			};
		} else {
			// conditionFieldsArr.push(`${keys[i]} = $${i+1}`);
			conditionFieldsArr.push(`${keys[i]} = ?`);
			valuesArr.push(obj[keys[i]]);
		}
	}
}

// UPDATE
const createUpdatePlaceholders = (obj, conditions) => {
	const keys = Object.keys(obj);
	const keys2 = Object.keys(conditions);
	let fieldsArr = [], conditionsArr = [], valuesArr = [];
	for(let i = 0; i <= keys.length; ++i) {
		if(i === keys.length) {
			for(let j = 0; j <= keys2.length; ++j) {
				if(j === keys2.length) {
					return {
						fields: fieldsArr.join(", "),
						conditionFields: conditionsArr.join(" AND "),
						values: valuesArr
					}
				} else {
					// conditionsArr.push(`${keys2[j]} = $${j+i+1}`);
					conditionsArr.push(`${keys2[j]} = ?`);
					valuesArr.push(conditions[keys2[j]]);
				}
			}
		} else {
			// fieldsArr.push(`${keys[i]} = $${i+1}`);
			fieldsArr.push(`${keys[i]} = ?`);
			valuesArr.push(obj[keys[i]]);
		}
	}
}

module.exports = class SQLHelper {
	constructor(conn) {
		this.conn = conn;
	}

	query = (arg) => {
		return new Promise( (resolve, reject) => {
			this.conn.query(arg, (err, rows, fields) => {
				if(err) {
					console.log(err);
					reject(err);
					return;
				}
				resolve(rows);
			});
		});
	}

	closeConn = () => {
		//this.conn.release();
		this.conn.end();
	}

	insert = (table, obj) => {
		return new Promise( (resolve, reject) => {
			if(!obj) {reject("Invalid insert operation: No Values"); return;}
			const { fields, placeholders, values } = createInsertPlaceholders(obj);
			return this.conn.query(`INSERT INTO ${table}(${fields}) VALUES(${placeholders})`, values, (err, rows, fields) => {
				if(err) {
					console.log(err);
					reject(err);
					return;
				}
				resolve(rows);
			});
		});
	}
	
	insertWithSet = (table, obj) => {
		return new Promise( (resolve, reject) => {
			if(!obj) {reject("Invalid insert operation: No Values"); return;}
			return this.conn.query(`INSERT INTO ${table} SET ?`, obj, (err, rows, fields) => {
				if(err) {
					console.log(err);
					reject(err);
					return;
				}
				resolve(rows);
			});
		});
	}

	select = async (table, fields = '*') => {
		return new Promise( (resolve, reject) => {
			this.conn.query(`SELECT ${fields} FROM ${table}`, null, (err, rows, fields) => {
				if(err) {
					console.log(err);
					reject(err);
					return;
				}
				resolve(rows);
			});
		});
	}

	selectWithConditions = async (table, fields = '*', conditions) => {
		return new Promise( (resolve, reject) => {
			if(!conditions) {return this.select(table, fields);}
			const { conditionFields, values } = createConditionsString(conditions);
			this.conn.query(`SELECT ${fields} FROM ${table} WHERE ${conditionFields}`, values, (err, rows, fields) => {
				if(err) {
					console.log(err);
					reject(err);
					return;
				}
				resolve(rows);
			});
		});
	}

	selectWithOrder = async (table, fields = '*', orderStr) => {
		return new Promise( (resolve, reject) => {
			let query = `SELECT ${fields} FROM ${table} ORDER BY ${orderStr}`;
			this.conn.query(query, (err, rows, fields) => {
				if(err) {
					console.log(err);
					reject(err);
					return;
				}
				resolve(rows);
			});
		});
	}
	conditionalSelectWithOrder = async (table, fields = '*', conditions, orderStr, limitStr) => {
		return new Promise( (resolve, reject) => {
			if(!conditions) {return this.select(table, fields);}
			const { conditionFields, values } = createConditionsString(conditions);
			let query = `SELECT ${fields} FROM ${table} WHERE ${conditionFields}`;
			if(orderStr) {
				query += ` ORDER BY ${orderStr}`;
			}
			if(limitStr) {
				query += ` LIMIT ${limitStr}`;
			}
			this.conn.query(query, values, (err, rows, fields) => {
				if(err) {
					console.log(err);
					reject(err);
					return;
				}
				resolve(rows);
			});
		});
	}

	selectWithPreQuery = (table, fields='*', conditions) => {
		if(!conditions) {return this.select(table, fields);}
		if(!conditions.startsWith('ORDER') && !conditions.startsWith('WHERE') && !conditions.startsWith('LIMIT')) {conditions = 'WHERE '+conditions}
		return new Promise( (resolve, reject) => {
			this.conn.query(`SELECT ${fields} FROM ${table} ${conditions}`, (err, rows, fields) => {
				if(err) {
					console.log(err);
					reject(err);
					return;
				}
				resolve(rows);
			});
		});
	}

	update = (table, obj, conditions) => {
		return new Promise( (resolve, reject) => {
			if(!obj) {reject("Invalid update operation: No Values"); return;}
			if(!conditions) {reject("Invalid update operation: No Conditions"); return;}
			const { fields, conditionFields, values } = createUpdatePlaceholders(obj, conditions);
			this.conn.query(`UPDATE ${table} SET ${fields} WHERE ${conditionFields}`, values, (err, rows, fields) => {
				if(err) {
					console.log(err);
					reject(err);
					return;
				}
				resolve(rows);
			});
		});
	}

	updateWithPreQuery = (table, fields, conditions) => {
		return new Promise( (resolve, reject) => {
			if(!conditions) {reject("Invalid update operation: No Conditions"); return;}
			const { conditionFields, values } = createConditionsString(conditions);
			this.conn.query(`UPDATE ${table} SET ${fields} WHERE ${conditionFields}`, values, (err, rows, fields) => {
				if(err) {
					console.log(err);
					reject(err);
					return;
				}
				resolve(rows);
			});
		});
	}

	updateDoubleCase = (table, obj, fields, conditions) => {
		return new Promise( (resolve, reject) => {
			if(!fields) {this.update(table, obj, conditions); return;}
			if(!obj) {this.updateWithPreQuery(table, fields, conditions); return;}
			if(!conditions) {reject("Invalid update operation: No Conditions"); return;}
			const { fields:objfields, conditionFields, values } = createUpdatePlaceholders(obj, conditions);
			this.conn.query(`UPDATE ${table} SET ${objfields}, ${fields} WHERE ${conditionFields}`, values, (err, rows, fields) => {
				if(err) {
					console.log(err);
					reject(err);
					return;
				}
				resolve(rows);
			});
		});
	}

	delete = (table, conditions) => {
		return new Promise( (resolve, reject) => {
			if(!conditions) {reject("Invalid delete operation: No Conditions"); return;}
			const { conditionFields, values } = createConditionsString(conditions);
			this.conn.query(`DELETE FROM ${table} WHERE ${conditionFields}`, values, (err, rows, fields) => {
				if(err) {
					console.log(err);
					reject(err);
					return;
				}
				resolve(rows);
			});
		});
	}
	deleteWithPreQuery = (table, conditions) => {
		return new Promise( (resolve, reject) => {
			if(!conditions) {reject("Invalid delete operation: No Conditions"); return;}
			this.conn.query(`DELETE FROM ${table} WHERE ${conditions}`, (err, rows, fields) => {
				if(err) {
					console.log(err);
					reject(err);
					return;
				}
				resolve(rows);
			});
		});
	}

	closeConnection = () => {
		if(this.conn){
			this.conn.end();
		}
	}
}