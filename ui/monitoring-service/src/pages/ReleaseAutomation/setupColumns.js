import React from 'react';
import { generalize, shortenString } from 'config/helpers';
import { Col, Row, UncontrolledTooltip } from "reactstrap";

export const getEnvironmentColumns = (page) => [
	{
		dataField: "id",
		text: "Environment ID",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}EnvID`}>{shortenString(row.id, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}EnvID`}>
				{row.id}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "display_name",
		text: "Display Name",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}EnvDisplayName`}>{shortenString(row.display_name, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}EnvDisplayName`}>
				{row.display_name}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "status",
		text: "Status",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}EnvStatus`}>{shortenString(row.status, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}EnvStatus`}>
				{row.status}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "view",
		isDummyField: true,
		text: "Actions",
		sort: false,
		formatter: (cellContent, row, i) => {
			return (
				<Row className="mb-2" style={{marginTop: '0rem', marginRight: '0rem'}}>
					<Col sm="12">
						<i className="mdi my-fs-1 cursor-pointer mdi-pencil mr-2" onClick={() => {page.toggleEnvironmentModal(row)}} />
						<i className="mdi my-fs-1 cursor-pointer mdi-delete" onClick={() => {page.removeEnvironment(row.id)}} />
					</Col>
				</Row>
			);
		},
	}
]
export const getTenantColumns = (page) => [
	{
		dataField: "id",
		text: "Tenant ID",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}TenantID`}>{shortenString(row.id, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}TenantID`}>
				{row.id}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "display_name",
		text: "Display Name",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}TenantDisplayName`}>{shortenString(row.display_name, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}TenantDisplayName`}>
				{row.display_name}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "tenant_name_id",
		text: "Name ID",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}TenantNameID`}>{shortenString(row.tenant_name_id, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}TenantNameID`}>
				{row.tenant_name_id}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "status",
		text: "Status",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}TenantStatus`}>{shortenString(row.status, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}TenantStatus`}>
				{row.status}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "view",
		isDummyField: true,
		text: "Actions",
		sort: false,
		formatter: (cellContent, row, i) => {
			return (
				<Row className="mb-2" style={{marginTop: '0rem', marginRight: '0rem'}}>
					<Col sm="12">
						<i className="mdi my-fs-1 cursor-pointer mdi-pencil mr-2" onClick={() => {page.toggleTenantModal(row)}} />
						<i className="mdi my-fs-1 cursor-pointer mdi-delete" onClick={() => {page.removeTenant(row.id)}} />
					</Col>
				</Row>
			);
		},
	}
]
export const getReleaseColumns = (page) => [
	{
		dataField: "id",
		text: "Release ID",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}ReleaseID`}>{shortenString(row.id, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}ReleaseID`}>
				{row.id}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "display_name",
		text: "Display Name",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}ReleaseDisplayName`}>{shortenString(row.display_name, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}ReleaseDisplayName`}>
				{row.display_name}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "branch",
		text: "Branch",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}ReleaseBranch`}>{shortenString(row.branch, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}ReleaseBranch`}>
				{row.branch}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "status",
		text: "Status",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}ReleaseStatus`}>{shortenString(row.status, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}ReleaseStatus`}>
				{row.status}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "view",
		isDummyField: true,
		text: "Actions",
		sort: false,
		formatter: (cellContent, row, i) => {
			return (
				<Row className="mb-2" style={{marginTop: '0rem', marginRight: '0rem'}}>
					<Col sm="12">
						<i className="mdi my-fs-1 cursor-pointer mdi-pencil mr-2" onClick={() => {page.toggleReleaseModal(row)}} />
						<i className="mdi my-fs-1 cursor-pointer mdi-delete" onClick={() => {page.removeRelease(row.id)}} />
					</Col>
				</Row>
			);
		},
	}
]
export const getTenantEnvironmentColumns = (page) => [
	// {
	// 	dataField: "id",
	// 	text: "ID",
	// 	sort: true,
	// 	formatter: (cellContent, row) => (
	// 		<>
	// 		<span id={`UncontrolledTooltip${generalize(row.id)}TenantEnvID`}>{shortenString(row.id, 25)}</span>
	// 		<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}TenantEnvID`}>
	// 			{row.id}
	// 		</UncontrolledTooltip>
	// 		</>
	// 	),
	// },
	{
		dataField: "tenant_id",
		text: "Tenant ID",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}TenantEnvTenantID`}>{shortenString(row.tenant_id, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}TenantEnvTenantID`}>
				{row.tenant_id}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "env_id",
		text: "Environment ID",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}TenantEnvEnvID`}>{shortenString(row.env_id, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}TenantEnvEnvID`}>
				{row.env_id}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "status",
		text: "Status",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}TenantEnvStatus`}>{shortenString(row.status, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}TenantEnvStatus`}>
				{row.status}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "view",
		isDummyField: true,
		text: "Actions",
		sort: false,
		formatter: (cellContent, row, i) => {
			return (
				<Row className="mb-2" style={{marginTop: '0rem', marginRight: '0rem'}}>
					<Col sm="12">
						<i className="mdi my-fs-1 cursor-pointer mdi-pencil mr-2" onClick={() => {page.toggleTenantEnvironmentModal(row)}} />
						<i className="mdi my-fs-1 cursor-pointer mdi-delete" onClick={() => {page.removeTenantEnvironment(row.id)}} />
					</Col>
				</Row>
			);
		},
	}
]
export const getReleaseEnvironmentColumns = (page) => [
	// {
	// 	dataField: "id",
	// 	text: "ID",
	// 	sort: true,
	// 	formatter: (cellContent, row) => (
	// 		<>
	// 		<span id={`UncontrolledTooltip${generalize(row.id)}ReleaseEnvID`}>{shortenString(row.id, 25)}</span>
	// 		<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}ReleaseEnvID`}>
	// 			{row.id}
	// 		</UncontrolledTooltip>
	// 		</>
	// 	),
	// },
	{
		dataField: "release_id",
		text: "Release ID",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}ReleaseEnvReleaseID`}>{shortenString(row.release_id, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}ReleaseEnvReleaseID`}>
				{row.release_id}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "env_id",
		text: "Environment ID",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}ReleaseEnvEnvID`}>{shortenString(row.env_id, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}ReleaseEnvEnvID`}>
				{row.env_id}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "status",
		text: "Status",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}ReleaseEnvStatus`}>{shortenString(row.status, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}ReleaseEnvStatus`}>
				{row.status}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "view",
		isDummyField: true,
		text: "Actions",
		sort: false,
		formatter: (cellContent, row, i) => {
			return (
				<Row className="mb-2" style={{marginTop: '0rem', marginRight: '0rem'}}>
					<Col sm="12">
						<i className="mdi my-fs-1 cursor-pointer mdi-pencil mr-2" onClick={() => {page.toggleReleaseEnvironmentModal(row)}} />
						<i className="mdi my-fs-1 cursor-pointer mdi-delete" onClick={() => {page.removeReleaseEnvironment(row.id)}} />
					</Col>
				</Row>
			);
		},
	}
]