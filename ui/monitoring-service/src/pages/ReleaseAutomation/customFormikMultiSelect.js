import React from 'react';
import { useField/* , Form, FormikProps, Formik */ } from 'formik';
import { MultiSelect } from "react-multi-select-component";
import { Label } from 'reactstrap';

export const MyMultiSelectField = ({ label, options, ...props }) => {
	const [field, meta, helpers] = useField(props);
	return (
		<>
			<Label for={props.name} className="form-label">
				{label}
			</Label>
			{/* <Field name={props.name}>
			{({field,
				form: { touched, errors },
				meta,
			}) => ( */}
				<MultiSelect
					name={props.name}
					options={options}
					value={meta.value || meta.initialValue}
					onChange={(val) => {props.onChange && props.onChange(val); helpers.setValue(val);}}
					labelledBy={label}
				/>
			{/* )}
			</Field> */}
		</>
	); 
};